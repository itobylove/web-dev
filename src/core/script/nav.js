import {shallowRef} from 'vue';
import {pinyin} from 'pinyin-pro';
import * as core from '@/core/script/core';
import {components, nav} from '@/core/config/nav';
import {authApply, saveUserConfig} from '@/core/script/api';
import dialog from '@/core/script/dialog';
import siyi from '@/core/script/siyi';


export const activeComponent = shallowRef();//当前活动的组件，默认为主页


//模块与导航默认值处理
nav.value.forEach((module, m) => {
    nav.value[m] = {
        //模块默认配置
        ...{
            id: '',
            title: '',
            icon: 'app',
            show: true,
            scope: 'user', //权限范围 user:所有人;admin:管理员;employee:员工;supplier:供应商
            items: [],
        },
        ...module
    };
    nav.value[m].items.forEach((item, i) => {
        //默认可配置项
        const _item = {
            ...{
                id: '',                            //ID
                key: '',                           //key
                cid: '',                           //CID 默认以CID查找模板，没有找到则用ID查找   cid =  componentsId
                title: '',                         //标题
                icon: 'ri-apps-2-ai-line',         //图标
                background: core.getRandomColor(), //手机版图标背景(只有手机版才生效)
                href: '',                          //直接连接
                query: {},                         // 跳转导航传参，扩展给各组件页面自行配置的参数
                group: '',                         //组名称 用于多版本的时候分组，也就是多版本时名称需要一样
                groupIcon: false,                  //多版本的时候要设置为true就可以出现版本图标选择历史版本
                show: true,                        //显示 隐藏 为了展示新的页面 但又不出现在导航内  如果搜索是可以搜索出来，若不想被搜索出来则关闭下面filter选项
                filter: true,                      //true 允许过滤 false不允许过滤
                api: [],                           //默认API（申请菜单权限时，和菜单权限一起申请）
                scope: 'user',                     //权限范围 user:所有人;admin:管理员;employee:员工;supplier:供应商
                auth: false,                        //是否有权限
                menus: {},                         //电脑端菜单
                tableOptions: {},                  //表格配置
                moblieWhere: false,                //手机端搜索条件显示与隐藏
                moblieMenu: false,                 //手机端操作菜单显示与隐藏
            },
            ...item
        };
        //不可配置项
        const id = _item.cid || _item.id;
        const component = components[siyi.pc ? id : `${id}_mobile`];
        const isAuth = siyi.user.permissions.includes(`nav_${_item.id}`);
        nav.value[m].items[i] = {
            ..._item,
            ...{
                open: false,                                              //标记是否已经打开，如果打开可以点击关闭
                moduleid: module.id,                                      //模块ID
                groupShow: false,                                         //是否显示子导航，用于出现多版本的时候显示或隐藏  历史导航上，也就是旧版本
                favorites: siyi.user.favorites.nav.includes(_item.id),   //是否收藏
                show: _item.id === 'home' ? true : siyi.user.type === 1 ? _item.show : isAuth && _item.show,       //内部用户才允许直接配置，其它用户必须要有权限有启动配置
                filter: _item.id === 'home' ? true : siyi.user.type === 1 ? _item.filter : isAuth && _item.filter, //内部用户才允许直接配置，其它用户必须要有权限有启动配置
                auth: _item.id === 'home' ? true : ((siyi.user.type === 1 && siyi.user.administrator) || isAuth || _item?.auth),     //有权限 亮 和 无权限 灰
                component: component ? shallowRef(component) : false,   //组件
            }
        };
    });
    //如果不是管理，scope=admin 不给看
    nav.value[m].items = nav.value[m].items.filter(item => siyi.user.administrator || (module?.scope !== 'admin' && item?.scope !== 'admin'));
    //按PC端与移动端类型过滤导航
    nav.value[m].items = nav.value[m].items.filter(item => item.component !== false);
    //非内部员工 如供应商，将没有权限的导航直接过滤掉不给看
    nav.value[m].items = nav.value[m].items.filter(item => siyi.user.type === 1 || item.auth);
    //把有权限的排序到最前面
    core.data.sortData(nav.value[m].items, 'auth', false);
    //旧版本分组
    nav.value[m].items.forEach((item1, i1) => {
        if (item1.group && !item1.groupIcon) {
            let i2 = 0;
            for (const key in nav.value[m].items) {
                const item2 = nav.value[m].items[key];
                if (item1.group === item2.group && item2.groupIcon) {
                    i2 = parseInt(key) + 1;
                    break;
                }
            }
            //把删除的插入到指定位置
            nav.value[m].items.splice(i2, 0, ...nav.value[m].items.splice(i1, 1));
        }
    });
});
//将没有导航的的模块过滤掉
nav.value = nav.value.filter(module => ['open', 'favorites'].includes(module.id) || module.items.length > 0);

/**
 * 给菜单申请权限
 * @param item
 * @returns {Promise<void|boolean>}
 */
const menuAuthApply = async (item) => {
    const data = [{name: `nav_${item.id}`, title: item.title}];
    item.api?.length > 0 && item.api.forEach((name) => data.push({name}));
    const res = await authApply({type: 2, data});
    return res ? dialog.success('申请成功,请等待审核') : false;
}


//记录打开的导航ID
let openList = []
/**
 * 跳转导航
 * @param id
 * @param query
 * @returns {boolean}
 */
export const to = (id, query = {}) => {
    if (id === siyi.nav.id) return true;//如果是当前有页面不作处理
    for1:for (const module of nav.value) {
        if (['open', 'favorites'].includes(module.id)) continue;
        for (const item of module.items) {
            if (item.id === id) {
                if (item.auth === false) {
                    dialog.confirm(`“${item.title}”权限未开通，是否申请？`, () => menuAuthApply(item));
                    return false;
                }
                if (item.open === false) item.key = `${id}${Date.now()}`; //关闭后强制刷新
                item.open = true;                         //标记已经打开
                siyi.from = {...siyi.nav};            //记录为来源导航
                siyi.from.query = {...siyi.from.query, ...query}; //上一次的query和当前的query合并
                siyi.nav = {...item};                          //当前活动的导航
                activeComponent.value = item.component;      //当前活动的组件
                !openList.includes(id) && openList.push(id);  //打开列表
                break for1;
            }
        }
    }
    if (id !== siyi.nav.id) {
        dialog.error('页面不存在');
        return false;
    }
    siyi.nav?.title && (document.title = siyi.nav.title); // 更新标题
    uofm('open');  //更新打开的
    return true;
}


/**
 * 返回来源页面
 * @param queryParams
 * @returns {boolean}
 */
export const back = (queryParams = {}) => to(siyi.from.id, queryParams);


/**
 * 关闭导航
 */
export const close = id => {
    for1:for (const module of nav.value) {
        for (const item of module.items) {
            if (item.id === id) {
                item.open = false;
                openList = openList.filter(item => item !== id);
                if (openList.length <= 0) {
                    siyi.nav = {};
                    siyi.nav = {};
                }
                break for1;
            }
        }
    }
    const lastId = openList[openList.length - 1];
    lastId === siyi.nav.id && uofm('open');
    to(lastId || 'home');
};


/**
 * 收藏
 * @param id
 */
export const favorites = async id => {
    for1:for (const module of nav.value) {
        for (const item of module.items) {
            if (item.id === id) {
                item.favorites = !item.favorites;
                if (item.favorites) {
                    siyi.user.favorites.nav.push(item.id);
                } else {
                    siyi.user.favorites.nav = siyi.user.favorites.nav.filter(id => id !== item.id);
                }
                break for1;
            }
        }
    }
    //更新收藏
    uofm('favorites');
    await saveUserConfig('nav', siyi.user.favorites.nav, 1, 'favorites');
};


/**
 * 更新打开、收藏的模块导航
 * uofm : update open favorites module
 * @param moduleid
 */
const uofm = moduleid => {
    //映射收藏或者已打开的导航
    const _items = [];
    //取到收藏或者已打开的列表
    const lists = {open: openList, favorites: siyi.user.favorites.nav};
    //映射导航
    lists[moduleid].forEach(list =>
        nav.value.forEach(module => !['open', 'favorites'].includes(module.id) && module.items.forEach(item =>
                item.id === list && item[moduleid] && _items.push(item)
            )
        )
    )
    //取到对应的模块
    for (const module of nav.value) {
        if (module.id === moduleid) {
            module.items = _items;
            break;
        }
    }
};
//更新收藏
uofm('favorites');


/**
 * 获取参数
 * @param key
 * @param unset
 * @returns {*}
 */
export const getQuery = (key = null, unset = false) => {
    let query = {...siyi.from.query, ...siyi.nav.query}
    if (unset) siyi.from.query = {}
    return typeof key === 'string' ? (query?.[key]) : query
}


/**
 * 过滤导航
 * @param title
 * @param moduleid
 * @returns {*}
 */
export const filter = (title, moduleid = '') => {
    nav.value.forEach(module => {
        if (module.id === moduleid || moduleid === '') {
            module.items.forEach(item => {
                if (item.filter) {
                    title = String(title).trim().toUpperCase();
                    let str = String(item.title + item.id).trim().toUpperCase();
                    pinyin(str, {type: 'array'}).forEach(py => str += py[0].toUpperCase());//转换为拼音并取到首字母
                    item.show = title === '' || str.includes(title);//搜索到了
                }
            })
        }
    })
}


/**
 * 获取导航与模块
 * @param id
 * @param module
 * @returns {*}
 */
export const get = (id, module = false) => {
    for (const m in nav.value) {
        if (module && nav.value[m] === id) return nav.value[m];
        for (const i in nav.value[m].items) {
            if (nav.value[m].items[i].id === id) return nav.value[m].items[i];
        }
    }
}


/**
 * 组切换
 * @param group
 */
export const groupSwitch = group => {
    nav.value.forEach(
        module => module.items.forEach(
            item => {
                if (item.group === group && item.groupIcon === false) item.groupShow = !item.groupShow;
            }
        )
    )
}


//导出
export {nav};
