
import axios from 'axios';
import { ipcRenderer } from 'electron';
import compareVersions from 'compare-versions';
const exec = require('child_process').exec;

export default {
    async getUpdate() {
      const appVersion = await ipcRenderer.invoke("getCurrentVersion")
      const github = await axios.get("https://api.github.com/repos/huhulacolle/TopitAuto/releases")
      const githubAppVersion = github.data[0].name
      if (compareVersions(githubAppVersion, appVersion) == 1) {
        const choice = await ipcRenderer.invoke("update?");
        if (!choice.response) {
          exec(`start ${github.data[0].assets[0].browser_download_url}`)
        }
        return true;
      }
      return false
    }
}