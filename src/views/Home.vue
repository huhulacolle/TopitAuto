<template>
  <div>
    <router-link to="/update" class="link-light h5 float-end update">A Propos / Mise à jour</router-link>
    <br><br>
    <form @submit.prevent="generateTop()">
      <h3>
        Quel est le sujet de ton Top ?
        De quoi est composé ton top ?
      </h3>
      <br>
      <input v-model="nomTop" class="form-control" type="text" placeholder="top" :disabled="generateBool" required>
      <br>
      <br>
      <h3>
        Quelle est la musique de ton Top ?
        Quelle musique souhaite-tu utiliser ?
      </h3>
      <br>
      <div class="text-center">
        <input type="text" placeholder="Upload" class="form-control" :value="musicPath" :disabled="generateBool"
          @click="sendMusic()" readonly required>
      </div>
      <br>
      <input type="submit" class="btn btn-light float-end" :disabled="generateBool">
    </form>
    <div class="text-center h3">
      {{message}}
    </div>
  </div>
  <div v-if="errorMessage" class="text-center h3" style="color: red;">
    {{errorMessage}}
  </div>
</template>

<script>
import { GOOGLE_IMG_SCRAP } from 'google-img-scrap';
import {ipcRenderer} from 'electron';
const exec = require('child_process').exec;

import * as JimpObj from 'jimp';
const Jimp = JimpObj.default;

export default {
  data() {
    return {
      nomTop: null,
      path: "image",
      errorMessage: null,
      message: null,
      musicPath: null,
      generateBool: false,
    }
  },
  methods: {
    async generateTop() {
      if (this.musicPath) {
        this.generateBool = true;
        this.errorMessage = null;
        this.message = null;
        this.message = "Récupération des images";
        const url = await this.google();
        this.message = "Téléchargement";
        const pathUrl = await ipcRenderer.invoke('download', url.result);
        this.message = "Compression";
        await this.resize(pathUrl);
        this.message = "création de la vidéo";
        await ipcRenderer.invoke('video', pathUrl, this.musicPath)
        .then(
          pathVideo => {
            this.message = `la vidéo est enregistrer dans ${pathVideo}`;
            exec(pathVideo);
          }
        )
        .catch(
          error => {
            this.message = error
          }
        );
        this.generateBool = false;
      }
    },
    async sendMusic() {
      this.musicPath = await ipcRenderer.invoke('getMusic');
    },
    async google() {
      return GOOGLE_IMG_SCRAP({
        search: this.nomTop,
        execute: function (element) {
          if (!element.url.match('gstatic.com')) return element;
        },
        limit: 10,
      });
    },
    async resize(pathUrl) {
      pathUrl.forEach(async p => {
        const imgresize = await Jimp.read(p);
        imgresize.resize(50, 50).write(p);
      });
    }
  }
}
</script>

<style scoped>
.update {
  text-decoration: none;
} 
.update:hover {
  text-decoration: underline;
}
</style>