"use strict";var e=require("@kinde-oss/kinde-typescript-sdk"),s=require("@remix-run/node"),t=require("jwt-decode");const n={clientId:process.env.KINDE_CLIENT_ID,clientSecret:process.env.KINDE_CLIENT_SECRET,issuerUrl:process.env.KINDE_ISSUER_URL,siteUrl:process.env.KINDE_SITE_URL,postLogoutRedirectUrl:process.env.KINDE_POST_LOGOUT_REDIRECT_URL,postLoginRedirectUrl:process.env.KINDE_POST_LOGIN_REDIRECT_URL,audience:process.env.KINDE_AUDIENCE},i=e.createKindeServerClient(e.GrantType.AUTHORIZATION_CODE,{authDomain:n.issuerUrl,clientId:n.clientId,clientSecret:n.clientSecret,redirectURL:n.siteUrl+"/kinde-auth/callback",logoutRedirectURL:n.postLogoutRedirectUrl}),o=s.createCookieSessionStorage({cookie:{name:"kinde_session",httpOnly:!0,path:"/",sameSite:"lax",secrets:[process.env.SESSION_SECRET],secure:"production"===process.env.NODE_ENV}}),r={s:"string",i:"integer",b:"boolean"};exports.createKindeApiClient=async s=>{let i=null;const r=s.headers.get("Cookie"),a=await o.getSession(r),c={getSessionItem:async e=>a.get(e),setSessionItem:async(e,s)=>a.set(e,s),removeSessionItem:async e=>a.unset(e),destroySession:async()=>o.destroySession(a)},l=await c.getSessionItem("kinde_api_access_token");if((e=>{const s=e&&e.access_token||e;if(!s)return!1;const i=t.jwtDecode(s,{header:!0}),o=t.jwtDecode(s);let r=!0;return n.audience&&(r=o.aud&&o.aud.includes(n.audience)),!!(o.iss==n.issuerURL&&"RS256"==i.alg&&o.exp>Math.floor(Date.now()/1e3)&&r)})(l))i=l;else{const e=await fetch(`${n.issuerUrl}/oauth2/token`,{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"client_credentials",client_id:n.clientId||"",client_secret:n.clientSecret||"",audience:n.audience||""})});i=(await e.json()).access_token;try{await c.setSessionItem("kinde_api_access_token",i)}catch(e){console.error(e)}}const d=new e.Configuration({basePath:n.issuerUrl,accessToken:i,headers:{Accept:"application/json"}});return{usersApi:new e.UsersApi(d),oauthApi:new e.OAuthApi(d),subscribersApi:new e.SubscribersApi(d),organizationsApi:new e.OrganizationsApi(d),connectedAppsApi:new e.ConnectedAppsApi(d),featureFlagsApi:new e.FeatureFlagsApi(d),environmentsApi:new e.EnvironmentsApi(d),permissionsApi:new e.PermissionsApi(d),rolesApi:new e.RolesApi(d),businessApi:new e.BusinessApi(d),industriesApi:new e.IndustriesApi(d),timezonesApi:new e.TimezonesApi(d),applicationsApi:new e.ApplicationsApi(d),callbacksApi:new e.CallbacksApi(d),apisApi:new e.APIsApi(d)}},exports.getKindeSession=async e=>{const s=e.headers.get("Cookie"),n=await o.getSession(s),i=n.get("user")||null,a=n.get("id_token")||null;let c;try{c=t.jwtDecode(a)}catch(e){}const l=n.get("access_token")||null;let d;try{d=t.jwtDecode(l)}catch(e){}const u=(e,s="accessToken")=>c||d?"accessToken"===s?d[e]:"idToken"===s?c[e]:null:null,p=u("permissions"),g=u("org_codes","idToken"),S=u("org_code"),w=(e,s,t)=>{const n=u("feature_flags"),i=n&&n[e]?n[e]:{};if(i=={}&&null==s)throw Error(`Flag ${e} was not found, and no default value has been provided`);if(t&&i.t&&t!==i.t)throw Error(`Flag ${e} is of type ${r[i.t]} - requested type ${r[t]}`);return{code:e,type:r[i.t||t],value:null==i.v?s:i.v,is_default:null==i.v,defaultValue:s}};return{user:i,idToken:c,accessToken:d,idTokenRaw:a,accessTokenRaw:l,permissions:p,userOrganizations:g,organization:S,getPermission:e=>p.includes(e)?{isGranted:!0,orgCode:S}:null,getFlag:w,getStringFlag:(e,s)=>{try{return w(e,s,"b").value}catch(e){console.error(e)}},getBooleanFlag:(e,s)=>{try{return w(e,s,"b").value}catch(e){console.error(e)}},getIntegerFlag:(e,s)=>{try{return w(e,s,"i").value}catch(e){console.error(e)}}}},exports.handleAuth=async(e,t)=>{const n=e.headers.get("Cookie"),r=await o.getSession(n),a={getSessionItem:async e=>r.get(e),setSessionItem:async(e,s)=>r.set(e,s),removeSessionItem:async e=>r.unset(e),destroySession:async()=>o.destroySession(r)};switch(t){case"login":return(async()=>{const e=await i.login(a);return s.redirect(e.toString(),{headers:{"Set-Cookie":await o.commitSession(r,{maxAge:604800})}})})();case"register":return(async()=>{const e=await i.register(a);return s.redirect(e.toString(),{headers:{"Set-Cookie":await o.commitSession(r,{maxAge:604800})}})})();case"callback":return(async()=>(await i.handleRedirectToApp(a,new URL(e.url)),s.redirect("/",{headers:{"Set-Cookie":await o.commitSession(r,{maxAge:604800})}})))();case"logout":return(async()=>{const e=await i.logout(a);return s.redirect(e.toString(),{headers:{"Set-Cookie":await o.destroySession(r)}})})()}};
