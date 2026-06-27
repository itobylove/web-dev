#!/bin/bash
# 统一默认时区（北京时间）
export TZ='Asia/Shanghai'

# 更新代码
git pull

#当前IP
LOCAL_IP=$(ip route get 1 | awk '{print $7;exit}')
case "$LOCAL_IP" in
    10.10.100.48)
        dev_dir="/data/www/siyi_frontend/dist"
        prod_dir="/data/www/siyi_frontend/public"
        backup_dir="/data/www/siyi_frontend/backup"
        ;;
    *)
        dev_dir="/data/www/website/frontend-test"
        prod_dir="/data/www/website/frontend"
        backup_dir="/data/www/website/frontend/backup"
        ;;
esac

cd "$prod_dir" || { echo "❌ 切换到目标目录失败"; exit 1; }

# ========== 查找最近的构建包 ==========
echo "📦 可用构建包（最近5个）："
IFS=$'\n' zip_list=($(ls -t "$dev_dir"/dist_*.zip 2>/dev/null | head -n 5))

if [ ${#zip_list[@]} -eq 0 ]; then
    echo "❌ 没有找到构建 zip 包：$dev_dir/dist_*.zip"
    exit 1
fi

# 展示列表（含人类时间）
for i in "${!zip_list[@]}"; do
    zip_file="${zip_list[$i]}"
    filename=$(basename "$zip_file")

    timestamp=$(echo "$filename" | sed -n 's/^dist_\([0-9]\+\)\.zip$/\1/p')
    if [[ "$timestamp" =~ ^[0-9]+$ ]]; then
        readable_time=$(date -d "@$((timestamp / 1000))" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || date -r $((timestamp / 1000)) "+%Y-%m-%d %H:%M:%S")
        echo "$((i+1)). $filename  [$readable_time]"
    else
        echo "$((i+1)). $filename"
    fi
done

# ========== 用户选择 ==========
read -p "请选择要部署的版本（1-${#zip_list[@]}，默认1）: " selection
selection=${selection:-1}

if ! [[ "$selection" =~ ^[1-5]$ ]] || [ "$selection" -gt "${#zip_list[@]}" ]; then
    echo "❌ 无效选择，任务已取消"
    exit 1
fi

selected_zip="${zip_list[$((selection-1))]}"
echo "✅ 选择版本：$selected_zip"

# ========== 解压到临时目录 ==========
temp_dir=$(mktemp -d)
unzip -q "$selected_zip" -d "$temp_dir" || { echo "❌ 解压失败"; rm -rf "$temp_dir"; exit 1; }

if [ ! -f "$temp_dir/version.js" ]; then
    echo "❌ 压缩包中没有 version.js，格式不合法"
    rm -rf "$temp_dir"
    exit 1
fi

# ========== 读取 version.js 中的版本号 ==========
new_version=$(grep -oP '(?<="version":")[0-9]+' "$temp_dir/version.js")

if [ -f version.js ]; then
    online_version=$(grep -oP '(?<="version":")[0-9]+' version.js)
else
    online_version=0
fi

# 格式化时间戳显示
new_version_date=$(date -d "@$((new_version / 1000))" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || date -r $((new_version / 1000)) "+%Y-%m-%d %H:%M:%S")
online_version_date=$(date -d "@$((online_version / 1000))" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || date -r $((online_version / 1000)) "+%Y-%m-%d %H:%M:%S")

echo "🕒 版本号对比： 线上版本 $online_version_date → 新版本$new_version_date"

if [ "$online_version" = "$new_version" ]; then
    echo "⚠️ 版本号无变化"
fi

read -p "请输入 Y 确认部署（默认Y），按任意键取消：" input
input=${input:-Y}
if [[ "$input" != "Y" && "$input" != "y" ]]; then
    echo "🚫 部署已取消"
    rm -rf "$temp_dir"
    exit 1
fi

# ========== 备份旧版本 ==========
backup_dir2="${backup_dir}/$(date +"%Y-%m-%d/%H-%M-%S")"
mkdir -p "$backup_dir2"

[ -f version.js ] && cp version.js "$backup_dir2/"
[ -f index.html ] && cp index.html "$backup_dir2/"
[ -d assets ] && cp -r assets "$backup_dir2/"

echo "📁 当前版本已备份至：$backup_dir2"

# ========== 替换新版本 ==========
[ -f version.js ] && rm version.js
[ -f index.html ] && rm index.html
[ -d assets ] && rm -rf assets

[ -f "$temp_dir/version.js" ] && cp "$temp_dir/version.js" ./
[ -f "$temp_dir/index.html" ] && cp "$temp_dir/index.html" ./
[ -d "$temp_dir/assets" ] && cp -r "$temp_dir/assets" ./

# 删除 .map 文件
find ./assets -name "*.js.map" -type f -delete

# ========== 校验部署是否成功 ==========
res_version=$(grep -oP '(?<="version":")[0-9]+' version.js)

if [ "$res_version" = "$new_version" ]; then
    echo "✅ 部署成功"
else
    echo "❌ 部署失败，版本号不一致"
fi

# ========== 清理临时目录 ==========
rm -rf "$temp_dir"

