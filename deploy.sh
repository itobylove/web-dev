#!/bin/bash
set -euo pipefail

# =============================================================================
# 用途：
# 1. 必须在当前脚本所在的 git 仓库中执行
# 2. 当前分支分三类：
#    - dev：团队开发分支
#    - master：线上分支
#    - 其它分支：个人开发分支
# 3. 若当前是个人开发分支，可选择先将远程个人分支 origin/当前分支 合并到 dev
#    注意：这里只合并“已推送到远程”的提交，本地未 push 的提交不会进入 dev
# 4. 将 origin/dev 发布到 master，生成合并记录
# 5. 若当前项目名命中前端项目名，且存在 build 脚本，则进入前端打包确认逻辑
# 6. 发布完成后，根据项目名选择对应 SSH 配置执行远程部署
# =============================================================================

# =========================
# 常量配置
# =========================
DEV_BRANCH="dev"
MAIN_BRANCH="master"

# 项目名配置
FRONTEND_PROJECT_NAME="frontend"
BACKEND_PROJECT_NAME="siyi_backend"

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_NAME="$(basename "$PROJECT_DIR")"

# =========================
# SSH / 部署配置（按项目区分）
# =========================

# 后端项目配置
BACKEND_SSH_USER="ltadmin"
BACKEND_SSH_HOST="10.10.100.50"
BACKEND_SSH_PORT="52013"
BACKEND_REMOTE_CMD="sudo /bin/sh /data/www/siyi_backend/pull.sh"

# 前端项目配置
FRONTEND_SSH_USER="ltadmin"
FRONTEND_SSH_HOST="10.10.100.100"
FRONTEND_SSH_PORT="52013"
FRONTEND_REMOTE_CMD="sudo /bin/sh /data/www/website/backend/pull.sh"

# 当前项目实际使用的部署配置
SSH_USER=""
SSH_HOST=""
SSH_PORT=""
REMOTE_CMD=""

# =========================
# 日志 / 错误
# =========================
log() {
  echo -e "[\033[32m$(date '+%H:%M:%S')\033[0m] $*"
}

fail() {
  echo "错误: $*" >&2
  exit 1
}

# =========================
# 前置检查
# =========================
[ -d "$PROJECT_DIR/.git" ] || fail "项目目录不是 git 仓库: $PROJECT_DIR"

cd "$PROJECT_DIR"

git rev-parse --git-dir >/dev/null 2>&1 || fail "当前目录不是有效的 git 仓库"

git rev-parse -q --verify MERGE_HEAD >/dev/null 2>&1 && fail "检测到正在 merge，请先处理完成"
git rev-parse -q --verify REBASE_HEAD >/dev/null 2>&1 && fail "检测到正在 rebase，请先处理完成"
[ -d ".git/rebase-merge" ] && fail "检测到正在 rebase，请先处理完成"
[ -d ".git/rebase-apply" ] && fail "检测到正在 rebase，请先处理完成"

# =========================
# 根据项目名加载部署配置
# =========================
if [ "$PROJECT_NAME" = "$BACKEND_PROJECT_NAME" ]; then
  SSH_USER="$BACKEND_SSH_USER"
  SSH_HOST="$BACKEND_SSH_HOST"
  SSH_PORT="$BACKEND_SSH_PORT"
  REMOTE_CMD="$BACKEND_REMOTE_CMD"
elif [ "$PROJECT_NAME" = "$FRONTEND_PROJECT_NAME" ]; then
  SSH_USER="$FRONTEND_SSH_USER"
  SSH_HOST="$FRONTEND_SSH_HOST"
  SSH_PORT="$FRONTEND_SSH_PORT"
  REMOTE_CMD="$FRONTEND_REMOTE_CMD"
else
  fail "未配置当前项目 [$PROJECT_NAME] 的部署信息"
fi

# =========================
# 当前分支判断
# =========================
USER_BRANCH="$(git rev-parse --abbrev-ref HEAD)"

if [ "$USER_BRANCH" = "$DEV_BRANCH" ]; then
  BRANCH_TYPE="dev"
elif [ "$USER_BRANCH" = "$MAIN_BRANCH" ]; then
  BRANCH_TYPE="master"
else
  BRANCH_TYPE="feature"
fi

log "当前项目: $PROJECT_NAME"
log "当前分支: $USER_BRANCH"
log "分支类型: $BRANCH_TYPE"
log "部署目标: $SSH_USER@$SSH_HOST:$SSH_PORT"

USER_STASH_MSG=""
DEV_STASH_MSG=""

DEPLOYED=0
SCRIPT_SUCCESS=0

# =========================
# 工具函数
# =========================
has_changes() {
  [ -n "$(git status --porcelain)" ]
}

ensure_remote_branch() {
  local branch="$1"
  git show-ref --verify --quiet "refs/remotes/origin/$branch" || fail "远程分支 origin/$branch 不存在"
}

find_stash_ref_by_message() {
  local msg="$1"
  git stash list | grep -F "$msg" | head -n1 | cut -d: -f1
}

create_stash() {
  local label="$1"
  local now
  now="$(date '+%F %T')"
  local msg="auto-stash:${label}:$$:${now}"
  git stash push -u -m "$msg" >/dev/null
  echo "$msg"
}

restore_stash_by_message() {
  local label="$1"
  local msg="$2"

  [ -n "$msg" ] || return 0

  local ref=""
  ref="$(find_stash_ref_by_message "$msg")"

  if [ -z "$ref" ]; then
    log "$label stash 不存在，跳过恢复"
    return 0
  fi

  log "恢复 ${label} 暂存内容"
  if git stash apply --index "$ref"; then
    git stash drop "$ref" >/dev/null 2>&1 || true
  else
    log "${label} stash 恢复有冲突，请手动处理：$ref"
    return 1
  fi
}

is_frontend_project() {
  [ "$PROJECT_NAME" = "$FRONTEND_PROJECT_NAME" ]
}

has_npm_build_script() {
  [ -f "package.json" ] || return 1

  if command -v jq >/dev/null 2>&1; then
    jq -e '.scripts.build' package.json >/dev/null 2>&1
  elif command -v node >/dev/null 2>&1; then
    node -e "const p=require('./package.json'); process.exit(p?.scripts?.build ? 0 : 1)" >/dev/null 2>&1
  else
    grep -q '"build"[[:space:]]*:' package.json
  fi
}

on_exit() {
  set +e

  local current_branch=""
  current_branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")"

  [ "$SCRIPT_SUCCESS" -eq 1 ] && return 0

  log "脚本异常退出，开始恢复现场"

  if [ -n "$DEV_STASH_MSG" ]; then
    if [ -n "$current_branch" ] && [ "$current_branch" != "$DEV_BRANCH" ]; then
      git switch "$DEV_BRANCH" >/dev/null 2>&1 || true
    fi
    restore_stash_by_message "$DEV_BRANCH" "$DEV_STASH_MSG" || true
  fi

  if [ -n "$USER_STASH_MSG" ]; then
    if [ "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '')" != "$USER_BRANCH" ]; then
      git switch "$USER_BRANCH" >/dev/null 2>&1 || true
    fi
    restore_stash_by_message "用户分支" "$USER_STASH_MSG" || true
  fi
}

trap on_exit EXIT

# =========================
# 拉取远程信息并检查主分支
# =========================
log "拉取远程分支信息"
git fetch origin --prune

ensure_remote_branch "$DEV_BRANCH"
ensure_remote_branch "$MAIN_BRANCH"

# =========================
# 1. 当前是个人分支时，可选先合并远程个人分支到 dev
# =========================
if [ "$BRANCH_TYPE" = "feature" ]; then
  if has_changes; then
    log "暂存用户分支 $USER_BRANCH"
    USER_STASH_MSG="$(create_stash "user-before-release-$USER_BRANCH")"
  fi

  read -r -p "是否先将当前分支 [$USER_BRANCH] 已推送到远程的内容合并到 $DEV_BRANCH？(y/n): " confirm
  confirm=${confirm:-y}
  if [[ "$confirm" =~ ^[yY]$ ]]; then
    log "开始合并 $USER_BRANCH 到 $DEV_BRANCH"
    ensure_remote_branch "$USER_BRANCH"

    ahead_count="$(git rev-list --count "origin/$USER_BRANCH..$USER_BRANCH" 2>/dev/null || echo 0)"
    if [ "${ahead_count:-0}" -gt 0 ]; then
      log "注意：当前分支有 ${ahead_count} 个本地未推送提交，本次只会合并 origin/$USER_BRANCH"
    fi

    log "切到 $DEV_BRANCH"
    git switch "$DEV_BRANCH"

    if has_changes; then
      log "$DEV_BRANCH 有未提交内容，先暂存"
      DEV_STASH_MSG="$(create_stash "dev-before-merge-$USER_BRANCH")"
    fi

    log "更新 $DEV_BRANCH"
    git pull --ff-only origin "$DEV_BRANCH"

    log "合并 origin/$USER_BRANCH 到 $DEV_BRANCH"
    git merge --no-ff "origin/$USER_BRANCH" -m "merge: origin/$USER_BRANCH into $DEV_BRANCH"

    log "推送 $DEV_BRANCH"
    git push origin "$DEV_BRANCH"

    log "刷新远程 $DEV_BRANCH 引用"
    git fetch origin "$DEV_BRANCH"

    log "恢复 $DEV_BRANCH 暂存内容"
    restore_stash_by_message "$DEV_BRANCH" "$DEV_STASH_MSG" || true
    DEV_STASH_MSG=""

    log "切回用户分支"
    git switch "$USER_BRANCH"
  else
    log "跳过合并到 $DEV_BRANCH"
  fi
fi

# =========================
# 2. 更新 dev
# =========================
log "切到 $DEV_BRANCH"
git switch "$DEV_BRANCH"

if has_changes; then
  log "$DEV_BRANCH 有未提交内容，先暂存"
  DEV_STASH_MSG="$(create_stash "dev-before-release")"
fi

log "更新 $DEV_BRANCH"
git pull --ff-only origin "$DEV_BRANCH"
git fetch origin "$DEV_BRANCH"

# =========================
# 3. 发布到 master
# =========================
log "切到 $MAIN_BRANCH"
git switch "$MAIN_BRANCH"

if has_changes; then
  fail "$MAIN_BRANCH 分支存在未提交内容，请先处理"
fi

log "更新 $MAIN_BRANCH"
git pull --ff-only origin "$MAIN_BRANCH"

log "本次将发布的提交"
git log --oneline "$MAIN_BRANCH"..origin/"$DEV_BRANCH" || true

if git merge-base --is-ancestor origin/"$DEV_BRANCH" "$MAIN_BRANCH"; then
  log "$MAIN_BRANCH 已包含 origin/$DEV_BRANCH，无需合并"
else
  log "合并 origin/$DEV_BRANCH 到 $MAIN_BRANCH"
  git merge --no-ff origin/"$DEV_BRANCH" -m "release: merge $DEV_BRANCH into $MAIN_BRANCH"

  log "推送 $MAIN_BRANCH"
  git push origin "$MAIN_BRANCH"
fi

# =========================
# 4. 打包（仅前端项目）
# =========================
if is_frontend_project && has_npm_build_script; then
  log "当前项目 [$PROJECT_NAME] 为前端项目，自动执行 npm run build"
  npm run build
else
  log "当前项目 [$PROJECT_NAME] 是前端项目，但未检测到 build 脚本，跳过打包"
fi

# =========================
# 5. 恢复现场
# =========================
if [ -n "$DEV_STASH_MSG" ]; then
  log "切回 $DEV_BRANCH"
  git switch "$DEV_BRANCH"
  restore_stash_by_message "$DEV_BRANCH" "$DEV_STASH_MSG" || true
  DEV_STASH_MSG=""
fi

log "切回原分支 $USER_BRANCH"
git switch "$USER_BRANCH"

if [ -n "$USER_STASH_MSG" ]; then
  restore_stash_by_message "用户分支" "$USER_STASH_MSG" || true
  USER_STASH_MSG=""
fi

# =========================
# 6. 远程部署
# =========================
read -r -p "是否执行远程部署？(y/n): " confirm
confirm=${confirm:-y}
if [[ "$confirm" =~ ^[yY]$ ]]; then
  log "远程执行部署"
  ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "$REMOTE_CMD"
  DEPLOYED=1
else
  log "跳过远程部署"
fi

SCRIPT_SUCCESS=1
log "发布完成（deploy=$DEPLOYED）"
