import {defineConfig} from '@playwright/test'
import {resolve} from 'node:path'
export default defineConfig({
 testDir:'./tests/browser',workers:2,timeout:30000,metadata:{contestBrowser:true},
 reporter:[['list'],['json',{outputFile:'.local/contest-browser-results.json'}]],
 use:{baseURL:'http://127.0.0.1:4330',viewport:{width:1440,height:1000},trace:'retain-on-failure',launchOptions:{executablePath:process.env.CHROME129_PATH||resolve('.local/chrome129/chrome-win64/chrome.exe')}},
 webServer:{command:'node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4330 --strictPort',url:'http://127.0.0.1:4330',reuseExistingServer:true,timeout:30000},
})
