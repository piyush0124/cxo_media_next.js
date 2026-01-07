"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/admin/categories/route";
exports.ids = ["app/api/admin/categories/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("stream");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fadmin%2Fcategories%2Froute&page=%2Fapi%2Fadmin%2Fcategories%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Fcategories%2Froute.ts&appDir=C%3A%5Cxampp%5Chtdocs%5Cnews-portal%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5Cxampp%5Chtdocs%5Cnews-portal&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fadmin%2Fcategories%2Froute&page=%2Fapi%2Fadmin%2Fcategories%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Fcategories%2Froute.ts&appDir=C%3A%5Cxampp%5Chtdocs%5Cnews-portal%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5Cxampp%5Chtdocs%5Cnews-portal&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_xampp_htdocs_news_portal_src_app_api_admin_categories_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/admin/categories/route.ts */ \"(rsc)/./src/app/api/admin/categories/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/admin/categories/route\",\n        pathname: \"/api/admin/categories\",\n        filename: \"route\",\n        bundlePath: \"app/api/admin/categories/route\"\n    },\n    resolvedPagePath: \"C:\\\\xampp\\\\htdocs\\\\news-portal\\\\src\\\\app\\\\api\\\\admin\\\\categories\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_xampp_htdocs_news_portal_src_app_api_admin_categories_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/admin/categories/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhZG1pbiUyRmNhdGVnb3JpZXMlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmFkbWluJTJGY2F0ZWdvcmllcyUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmFkbWluJTJGY2F0ZWdvcmllcyUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDeGFtcHAlNUNodGRvY3MlNUNuZXdzLXBvcnRhbCU1Q3NyYyU1Q2FwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9QyUzQSU1Q3hhbXBwJTVDaHRkb2NzJTVDbmV3cy1wb3J0YWwmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFzRztBQUN2QztBQUNjO0FBQzBCO0FBQ3ZHO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnSEFBbUI7QUFDM0M7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsaUVBQWlFO0FBQ3pFO0FBQ0E7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDdUg7O0FBRXZIIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbmV4dGpzLW5ld3MtcG9ydGFsLz9iYTdjIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkM6XFxcXHhhbXBwXFxcXGh0ZG9jc1xcXFxuZXdzLXBvcnRhbFxcXFxzcmNcXFxcYXBwXFxcXGFwaVxcXFxhZG1pblxcXFxjYXRlZ29yaWVzXFxcXHJvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9hZG1pbi9jYXRlZ29yaWVzL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvYWRtaW4vY2F0ZWdvcmllc1wiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvYWRtaW4vY2F0ZWdvcmllcy9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkM6XFxcXHhhbXBwXFxcXGh0ZG9jc1xcXFxuZXdzLXBvcnRhbFxcXFxzcmNcXFxcYXBwXFxcXGFwaVxcXFxhZG1pblxcXFxjYXRlZ29yaWVzXFxcXHJvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9hZG1pbi9jYXRlZ29yaWVzL3JvdXRlXCI7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHNlcnZlckhvb2tzLFxuICAgICAgICBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIG9yaWdpbmFsUGF0aG5hbWUsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fadmin%2Fcategories%2Froute&page=%2Fapi%2Fadmin%2Fcategories%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Fcategories%2Froute.ts&appDir=C%3A%5Cxampp%5Chtdocs%5Cnews-portal%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5Cxampp%5Chtdocs%5Cnews-portal&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./src/app/api/admin/categories/route.ts":
/*!***********************************************!*\
  !*** ./src/app/api/admin/categories/route.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./src/lib/prisma.ts\");\n/* harmony import */ var _lib_session__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/session */ \"(rsc)/./src/lib/session.ts\");\n\n\n\nasync function GET() {\n    const session = (0,_lib_session__WEBPACK_IMPORTED_MODULE_2__.getSession)();\n    if (!session) return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        ok: false\n    }, {\n        status: 401\n    });\n    const categories = await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.category.findMany({\n        orderBy: {\n            name: \"asc\"\n        }\n    });\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        ok: true,\n        categories\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS9hZG1pbi9jYXRlZ29yaWVzL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBMkM7QUFDTDtBQUNLO0FBRXBDLGVBQWVHO0lBQ3BCLE1BQU1DLFVBQVVGLHdEQUFVQTtJQUMxQixJQUFJLENBQUNFLFNBQVMsT0FBT0oscURBQVlBLENBQUNLLElBQUksQ0FBQztRQUFFQyxJQUFJO0lBQU0sR0FBRztRQUFFQyxRQUFRO0lBQUk7SUFFcEUsTUFBTUMsYUFBYSxNQUFNUCwrQ0FBTUEsQ0FBQ1EsUUFBUSxDQUFDQyxRQUFRLENBQUM7UUFBRUMsU0FBUztZQUFFQyxNQUFNO1FBQU07SUFBRTtJQUM3RSxPQUFPWixxREFBWUEsQ0FBQ0ssSUFBSSxDQUFDO1FBQUVDLElBQUk7UUFBTUU7SUFBVztBQUNsRCIsInNvdXJjZXMiOlsid2VicGFjazovL25leHRqcy1uZXdzLXBvcnRhbC8uL3NyYy9hcHAvYXBpL2FkbWluL2NhdGVnb3JpZXMvcm91dGUudHM/MTBmOCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVzcG9uc2UgfSBmcm9tIFwibmV4dC9zZXJ2ZXJcIjtcclxuaW1wb3J0IHsgcHJpc21hIH0gZnJvbSBcIkAvbGliL3ByaXNtYVwiO1xyXG5pbXBvcnQgeyBnZXRTZXNzaW9uIH0gZnJvbSBcIkAvbGliL3Nlc3Npb25cIjtcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBHRVQoKSB7XHJcbiAgY29uc3Qgc2Vzc2lvbiA9IGdldFNlc3Npb24oKTtcclxuICBpZiAoIXNlc3Npb24pIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IG9rOiBmYWxzZSB9LCB7IHN0YXR1czogNDAxIH0pO1xyXG5cclxuICBjb25zdCBjYXRlZ29yaWVzID0gYXdhaXQgcHJpc21hLmNhdGVnb3J5LmZpbmRNYW55KHsgb3JkZXJCeTogeyBuYW1lOiBcImFzY1wiIH0gfSk7XHJcbiAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgb2s6IHRydWUsIGNhdGVnb3JpZXMgfSk7XHJcbn1cclxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsInByaXNtYSIsImdldFNlc3Npb24iLCJHRVQiLCJzZXNzaW9uIiwianNvbiIsIm9rIiwic3RhdHVzIiwiY2F0ZWdvcmllcyIsImNhdGVnb3J5IiwiZmluZE1hbnkiLCJvcmRlckJ5IiwibmFtZSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/admin/categories/route.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/prisma.ts":
/*!***************************!*\
  !*** ./src/lib/prisma.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst globalForPrisma = globalThis;\nconst prisma = globalForPrisma.prisma ?? new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient({\n    log: [\n        \"error\"\n    ]\n});\nif (true) globalForPrisma.prisma = prisma;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL3ByaXNtYS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBOEM7QUFFOUMsTUFBTUMsa0JBQWtCQztBQUVqQixNQUFNQyxTQUNYRixnQkFBZ0JFLE1BQU0sSUFDdEIsSUFBSUgsd0RBQVlBLENBQUM7SUFDZkksS0FBSztRQUFDO0tBQVE7QUFDaEIsR0FBRztBQUVMLElBQUlDLElBQXFDLEVBQUVKLGdCQUFnQkUsTUFBTSxHQUFHQSIsInNvdXJjZXMiOlsid2VicGFjazovL25leHRqcy1uZXdzLXBvcnRhbC8uL3NyYy9saWIvcHJpc21hLnRzPzAxZDciXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJpc21hQ2xpZW50IH0gZnJvbSBcIkBwcmlzbWEvY2xpZW50XCI7XG5cbmNvbnN0IGdsb2JhbEZvclByaXNtYSA9IGdsb2JhbFRoaXMgYXMgdW5rbm93biBhcyB7IHByaXNtYT86IFByaXNtYUNsaWVudCB9O1xuXG5leHBvcnQgY29uc3QgcHJpc21hID1cbiAgZ2xvYmFsRm9yUHJpc21hLnByaXNtYSA/P1xuICBuZXcgUHJpc21hQ2xpZW50KHtcbiAgICBsb2c6IFtcImVycm9yXCJdLFxuICB9KTtcblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSBcInByb2R1Y3Rpb25cIikgZ2xvYmFsRm9yUHJpc21hLnByaXNtYSA9IHByaXNtYTtcbiJdLCJuYW1lcyI6WyJQcmlzbWFDbGllbnQiLCJnbG9iYWxGb3JQcmlzbWEiLCJnbG9iYWxUaGlzIiwicHJpc21hIiwibG9nIiwicHJvY2VzcyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/prisma.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/session.ts":
/*!****************************!*\
  !*** ./src/lib/session.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   clearSessionCookie: () => (/* binding */ clearSessionCookie),\n/* harmony export */   getSession: () => (/* binding */ getSession),\n/* harmony export */   requireAdmin: () => (/* binding */ requireAdmin),\n/* harmony export */   setSessionCookie: () => (/* binding */ setSessionCookie),\n/* harmony export */   signSession: () => (/* binding */ signSession)\n/* harmony export */ });\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jsonwebtoken */ \"(rsc)/./node_modules/jsonwebtoken/index.js\");\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(jsonwebtoken__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_headers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/headers */ \"(rsc)/./node_modules/next/dist/api/headers.js\");\n\n\nconst COOKIE_NAME = \"admin_token\";\nfunction signSession(payload) {\n    const secret = process.env.ADMIN_JWT_SECRET;\n    return jsonwebtoken__WEBPACK_IMPORTED_MODULE_0___default().sign(payload, secret, {\n        expiresIn: \"7d\"\n    });\n}\nfunction setSessionCookie(token) {\n    (0,next_headers__WEBPACK_IMPORTED_MODULE_1__.cookies)().set(COOKIE_NAME, token, {\n        httpOnly: true,\n        sameSite: \"lax\",\n        secure: false,\n        path: \"/\"\n    });\n}\nfunction clearSessionCookie() {\n    (0,next_headers__WEBPACK_IMPORTED_MODULE_1__.cookies)().set(COOKIE_NAME, \"\", {\n        httpOnly: true,\n        path: \"/\",\n        maxAge: 0\n    });\n}\nfunction getSession() {\n    const token = (0,next_headers__WEBPACK_IMPORTED_MODULE_1__.cookies)().get(COOKIE_NAME)?.value;\n    if (!token) return null;\n    try {\n        const secret = process.env.ADMIN_JWT_SECRET;\n        return jsonwebtoken__WEBPACK_IMPORTED_MODULE_0___default().verify(token, secret);\n    } catch  {\n        return null;\n    }\n}\nfunction requireAdmin() {\n    const session = getSession();\n    if (!session || session.role !== \"ADMIN\") {\n        throw new Error(\"UNAUTHORIZED\");\n    }\n    return session;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL3Nlc3Npb24udHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBK0I7QUFDUTtBQUV2QyxNQUFNRSxjQUFjO0FBUWIsU0FBU0MsWUFBWUMsT0FBcUI7SUFDL0MsTUFBTUMsU0FBU0MsUUFBUUMsR0FBRyxDQUFDQyxnQkFBZ0I7SUFDM0MsT0FBT1Isd0RBQVEsQ0FBQ0ksU0FBU0MsUUFBUTtRQUFFSyxXQUFXO0lBQUs7QUFDckQ7QUFFTyxTQUFTQyxpQkFBaUJDLEtBQWE7SUFDNUNYLHFEQUFPQSxHQUFHWSxHQUFHLENBQUNYLGFBQWFVLE9BQU87UUFDaENFLFVBQVU7UUFDVkMsVUFBVTtRQUNWQyxRQUFRO1FBQ1JDLE1BQU07SUFDUjtBQUNGO0FBRU8sU0FBU0M7SUFDZGpCLHFEQUFPQSxHQUFHWSxHQUFHLENBQUNYLGFBQWEsSUFBSTtRQUFFWSxVQUFVO1FBQU1HLE1BQU07UUFBS0UsUUFBUTtJQUFFO0FBQ3hFO0FBRU8sU0FBU0M7SUFDZCxNQUFNUixRQUFRWCxxREFBT0EsR0FBR29CLEdBQUcsQ0FBQ25CLGNBQWNvQjtJQUMxQyxJQUFJLENBQUNWLE9BQU8sT0FBTztJQUVuQixJQUFJO1FBQ0YsTUFBTVAsU0FBU0MsUUFBUUMsR0FBRyxDQUFDQyxnQkFBZ0I7UUFDM0MsT0FBT1IsMERBQVUsQ0FBQ1ksT0FBT1A7SUFDM0IsRUFBRSxPQUFNO1FBQ04sT0FBTztJQUNUO0FBQ0Y7QUFFTyxTQUFTbUI7SUFDZCxNQUFNQyxVQUFVTDtJQUNoQixJQUFJLENBQUNLLFdBQVdBLFFBQVFDLElBQUksS0FBSyxTQUFTO1FBQ3hDLE1BQU0sSUFBSUMsTUFBTTtJQUNsQjtJQUNBLE9BQU9GO0FBQ1QiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9uZXh0anMtbmV3cy1wb3J0YWwvLi9zcmMvbGliL3Nlc3Npb24udHM/OGRmOSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgand0IGZyb20gXCJqc29ud2VidG9rZW5cIjtcclxuaW1wb3J0IHsgY29va2llcyB9IGZyb20gXCJuZXh0L2hlYWRlcnNcIjtcclxuXHJcbmNvbnN0IENPT0tJRV9OQU1FID0gXCJhZG1pbl90b2tlblwiO1xyXG5cclxuZXhwb3J0IHR5cGUgQWRtaW5TZXNzaW9uID0ge1xyXG4gIGlkOiBudW1iZXI7XHJcbiAgdXNlcm5hbWU6IHN0cmluZztcclxuICByb2xlOiBcIkFETUlOXCIgfCBcIkFVVEhPUlwiO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNpZ25TZXNzaW9uKHBheWxvYWQ6IEFkbWluU2Vzc2lvbikge1xyXG4gIGNvbnN0IHNlY3JldCA9IHByb2Nlc3MuZW52LkFETUlOX0pXVF9TRUNSRVQhO1xyXG4gIHJldHVybiBqd3Quc2lnbihwYXlsb2FkLCBzZWNyZXQsIHsgZXhwaXJlc0luOiBcIjdkXCIgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRTZXNzaW9uQ29va2llKHRva2VuOiBzdHJpbmcpIHtcclxuICBjb29raWVzKCkuc2V0KENPT0tJRV9OQU1FLCB0b2tlbiwge1xyXG4gICAgaHR0cE9ubHk6IHRydWUsXHJcbiAgICBzYW1lU2l0ZTogXCJsYXhcIixcclxuICAgIHNlY3VyZTogZmFsc2UsIC8vIHNldCB0cnVlIGluIHByb2R1Y3Rpb24gaHR0cHNcclxuICAgIHBhdGg6IFwiL1wiLFxyXG4gIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJTZXNzaW9uQ29va2llKCkge1xyXG4gIGNvb2tpZXMoKS5zZXQoQ09PS0lFX05BTUUsIFwiXCIsIHsgaHR0cE9ubHk6IHRydWUsIHBhdGg6IFwiL1wiLCBtYXhBZ2U6IDAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRTZXNzaW9uKCk6IEFkbWluU2Vzc2lvbiB8IG51bGwge1xyXG4gIGNvbnN0IHRva2VuID0gY29va2llcygpLmdldChDT09LSUVfTkFNRSk/LnZhbHVlO1xyXG4gIGlmICghdG9rZW4pIHJldHVybiBudWxsO1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3Qgc2VjcmV0ID0gcHJvY2Vzcy5lbnYuQURNSU5fSldUX1NFQ1JFVCE7XHJcbiAgICByZXR1cm4gand0LnZlcmlmeSh0b2tlbiwgc2VjcmV0KSBhcyBBZG1pblNlc3Npb247XHJcbiAgfSBjYXRjaCB7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiByZXF1aXJlQWRtaW4oKTogQWRtaW5TZXNzaW9uIHtcclxuICBjb25zdCBzZXNzaW9uID0gZ2V0U2Vzc2lvbigpO1xyXG4gIGlmICghc2Vzc2lvbiB8fCBzZXNzaW9uLnJvbGUgIT09IFwiQURNSU5cIikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVU5BVVRIT1JJWkVEXCIpO1xyXG4gIH1cclxuICByZXR1cm4gc2Vzc2lvbjtcclxufVxyXG4iXSwibmFtZXMiOlsiand0IiwiY29va2llcyIsIkNPT0tJRV9OQU1FIiwic2lnblNlc3Npb24iLCJwYXlsb2FkIiwic2VjcmV0IiwicHJvY2VzcyIsImVudiIsIkFETUlOX0pXVF9TRUNSRVQiLCJzaWduIiwiZXhwaXJlc0luIiwic2V0U2Vzc2lvbkNvb2tpZSIsInRva2VuIiwic2V0IiwiaHR0cE9ubHkiLCJzYW1lU2l0ZSIsInNlY3VyZSIsInBhdGgiLCJjbGVhclNlc3Npb25Db29raWUiLCJtYXhBZ2UiLCJnZXRTZXNzaW9uIiwiZ2V0IiwidmFsdWUiLCJ2ZXJpZnkiLCJyZXF1aXJlQWRtaW4iLCJzZXNzaW9uIiwicm9sZSIsIkVycm9yIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/session.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/semver","vendor-chunks/jsonwebtoken","vendor-chunks/jws","vendor-chunks/ecdsa-sig-formatter","vendor-chunks/safe-buffer","vendor-chunks/ms","vendor-chunks/lodash.once","vendor-chunks/lodash.isstring","vendor-chunks/lodash.isplainobject","vendor-chunks/lodash.isnumber","vendor-chunks/lodash.isinteger","vendor-chunks/lodash.isboolean","vendor-chunks/lodash.includes","vendor-chunks/jwa","vendor-chunks/buffer-equal-constant-time"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fadmin%2Fcategories%2Froute&page=%2Fapi%2Fadmin%2Fcategories%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Fcategories%2Froute.ts&appDir=C%3A%5Cxampp%5Chtdocs%5Cnews-portal%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5Cxampp%5Chtdocs%5Cnews-portal&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();