import { createElement } from 'react';
import dynamic from 'dva/dynamic';
import pathToRegexp from 'path-to-regexp';
import { map } from 'lodash';
import { getMenuData } from './menu';


let routerDataCache;

const modelNotExisted = (app, model) =>
  // eslint-disable-next-line
  !app._models.some(({
    namespace,
  }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  });

// wrapper of dynamic
const dynamicWrapper = (app, models, component) => {
  // () => require('module')
  // transformed by babel-plugin-dynamic-import-node-sync
  if (component.toString().indexOf('.then(') < 0) {
    models.forEach(model => {
      if (modelNotExisted(app, model)) {
        // eslint-disable-next-line
        app.model(require(`../models/${model}`).default);
      }
    });
    return props => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return createElement(component().default, {
        ...props,
        routerData: routerDataCache,
      });
    };
  }
  // () => import('module')
  return dynamic({
    app,
    models: () =>
      models.filter(model => modelNotExisted(app, model)).map(m =>
        import (`../models/${m}.js`)),
    // add routerData prop
    component: () => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return component().then(raw => {
        const Component = raw.default || raw;
        return props =>
          createElement(Component, {
            ...props,
            routerData: routerDataCache,
          });
      });
    },
  });
};

function getFlatMenuData(menus) {
  let keys = {};
  menus.forEach(item => {
    if (item.children) {
      keys[item.path] = { ...item,
      };
      keys = { ...keys,
        ...getFlatMenuData(item.children),
      };
    } else {
      keys[item.path] = { ...item,
      };
    }
  });
  return keys;
}

export const getRouterData = app => {
  const routerConfig = {
    '/': {
      component: dynamicWrapper(app, ['user', 'login'], () =>
        import('../layouts/BasicLayout')),
    },
    '/dashboard/analysis': {
      component: dynamicWrapper(app, ['chart'], () =>
        import('../containers/Dashboard/Analysis')),
    },
    '/dashboard/monitor': {
      component: dynamicWrapper(app, ['monitor'], () =>
        import('../containers/Dashboard/Monitor')),
    },
    '/dashboard/workplace': {
      component: dynamicWrapper(app, ['project', 'activities', 'chart'], () =>
        import('../containers/Dashboard/Workplace')
      ),
      // hideInBreadcrumb: true,
      // name: '工作台',
      // authority: 'admin',
    },

    '/setting/settingChart': {
      component: dynamicWrapper(app, [], () =>
        import('../containers/Setting/SettingChart')),
    },

    '/home/backlog': {
      name: '待办事项',
      component: dynamicWrapper(app, ['home/backlogModel'], () => import ('../containers/Home/Backlog'))
    },

    '/setting/user-manager': {
      name:'用户管理',
      component: dynamicWrapper(app, ['settings/userManagerModel'], () => import('../containers/Setting/UserManager')),
    },

    '/setting/request-auth': {
      name: '权限申请',
      component: dynamicWrapper(app, [], () => import ('../containers/Setting/RequestAuth')),
    },

    '/basic/button': {
      name:'按钮',
      component: dynamicWrapper(app,[],()=> import('../containers/UI/Button/index'))
    },

    '/basic/input': {
      name:'输入框',
      component: dynamicWrapper(app,[],()=> import('../containers/UI/Input/index'))
    },

    // '/form/basic-form': {
    //   component: dynamicWrapper(app, ['form'], () =>
    //     import ('../containers/Forms/BasicForm')),
    // },
    // '/form/step-form': {
    //   component: dynamicWrapper(app, ['form'], () =>
    //     import ('../containers/Forms/StepForm')),
    // },
    // '/form/step-form/info': {
    //   name: '分步表单（填写转账信息）',
    //   component: dynamicWrapper(app, ['form'], () =>
    //     import ('../containers/Forms/StepForm/Step1')),
    // },
    // '/form/step-form/confirm': {
    //   name: '分步表单（确认转账信息）',
    //   component: dynamicWrapper(app, ['form'], () =>
    //     import ('../containers/Forms/StepForm/Step2')),
    // },
    // '/form/step-form/result': {
    //   name: '分步表单（完成）',
    //   component: dynamicWrapper(app, ['form'], () =>
    //     import ('../containers/Forms/StepForm/Step3')),
    // },
    // '/form/advanced-form': {
    //   component: dynamicWrapper(app, ['form'], () =>
    //     import ('../containers/Forms/AdvancedForm')),
    // },
    // '/list/table-list': {
    //   component: dynamicWrapper(app, ['rule'], () =>
    //     import ('../containers/List/TableList')),
    // },
    // '/list/basic-list': {
    //   component: dynamicWrapper(app, ['list'], () =>
    //     import ('../containers/List/BasicList')),
    // },
    // '/list/card-list': {
    //   component: dynamicWrapper(app, ['list'], () =>
    //     import ('../containers/List/CardList')),
    // },
    // '/list/search': {
    //   component: dynamicWrapper(app, ['list'], () =>
    //     import ('../containers/List/List')),
    // },
    // '/list/search/projects': {
    //   component: dynamicWrapper(app, ['list'], () =>
    //     import ('../containers/List/Projects')),
    // },
    // '/list/search/applications': {
    //   component: dynamicWrapper(app, ['list'], () =>
    //     import ('../containers/List/Applications')),
    // },
    // '/list/search/articles': {
    //   component: dynamicWrapper(app, ['list'], () =>
    //     import ('../containers/List/Articles')),
    // },
    // '/profile/basic': {
    //   component: dynamicWrapper(app, ['profile'], () =>
    //     import ('../containers/Profile/BasicProfile')),
    // },
    // '/profile/advanced': {
    //   component: dynamicWrapper(app, ['profile'], () =>
    //     import ('../containers/Profile/AdvancedProfile')
    //   ),
    // },
    // '/result/success': {
    //   component: dynamicWrapper(app, [], () =>
    //     import ('../containers/Result/Success')),
    // },
    // '/result/fail': {
    //   component: dynamicWrapper(app, [], () =>
    //     import ('../containers/Result/Error')),
    // },
    '/exception/403': {
      component: dynamicWrapper(app, [], () =>
        import ('../containers/Exception/403')),
    },
    '/exception/404': {
      component: dynamicWrapper(app, [], () =>
        import ('../containers/Exception/404')),
    },
    '/exception/500': {
      component: dynamicWrapper(app, [], () =>
        import ('../containers/Exception/500')),
    },
    '/exception/trigger': {
      component: dynamicWrapper(app, ['error'], () =>
        import ('../containers/Exception/triggerException')
      ),
    },
    '/user': {
      component: dynamicWrapper(app, [], () =>
        import ('../layouts/UserLayout')),
    },
    '/user/login': {
      component: dynamicWrapper(app, ['login'], () =>
        import ('../containers/User/Login')),
    },
    '/user/register': {
      component: dynamicWrapper(app, ['register'], () =>
        import ('../containers/User/Register')),
    },
    '/user/register-result': {
      component: dynamicWrapper(app, [], () =>
        import ('../containers/User/RegisterResult')),
    },
    // '/user/:id': {
    //   component: dynamicWrapper(app, [], () => import('../containers/User/SomeComponent')),
    // },
  };
  // Get name from ./menu.js or just set it in the router data.
  const menuData = getFlatMenuData(getMenuData());

  // Route configuration data
  // eg. {name,authority ...routerConfig }
  const routerData = {};
  // The route matches the menu
  Object.keys(routerConfig).forEach(path => {
    // Regular match item name
    // eg.  router /user/:id === /user/chen
    const pathRegexp = pathToRegexp(path);
    const menuKey = Object.keys(menuData).find(key => pathRegexp.test(`${key}`));
    let menuItem = {};
    // If menuKey is not empty
    if (menuKey) {
      menuItem = menuData[menuKey];
    }
    let router = routerConfig[path];
    // If you need to configure complex parameter routing,
    // https://github.com/ant-design/ant-design-pro-site/blob/master/docs/router-and-nav.md#%E5%B8%A6%E5%8F%82%E6%95%B0%E7%9A%84%E8%B7%AF%E7%94%B1%E8%8F%9C%E5%8D%95
    // eg . /list/:type/user/info/:id
    router = {
      ...router,
      name: router.name || menuItem.name,
      authority: router.authority || menuItem.authority,
      hideInBreadcrumb: router.hideInBreadcrumb || menuItem.hideInBreadcrumb,
    };
    routerData[path] = router;
  });
  return routerData;
};
