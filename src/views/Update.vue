<template>
    <div>
        <router-link to="/" class="float-start h5"> <img src="@/assets/return.png" width="40"> </router-link>
        <br><br>
        <div class="text-center">
            <img src="@/assets/github.png" width="100">
            <br><br>
            <h6 @click="checkUpdate()" class="button">verifier les mises à jours</h6>
        </div>
        <br> 
        <div class="mx-auto desc" style="width: 500px;">
            <div class="container h6">
                <br>
                <p>Version : {{Sys.version}}</p>
                <p>Electron : {{Sys.electron}} </p>
                <p>Node.js : {{Sys.node}}</p>
                <p>Chromium : {{Sys.chrome}} </p>
                <!-- <p>Vue : {{Vue.version}}</p> -->
                <p>OS : {{Sys.os}} </p>
            </div>
        </div>

    </div>
</template>

<script>
import {ipcRenderer} from 'electron';
import update from '@/services/update';

export default {
    data() {
        return {
            Sys: {}
        }
    },
    async created() {
        this.Sys = await ipcRenderer.invoke('InfoSyst');
    },
    methods: {
        async checkUpdate() {
            const boolUpdate = await update.getUpdate();
            if (!boolUpdate) {
                await ipcRenderer.invoke("noUpdate");
            }
        }
    }
}
</script>

<style scoped>
.button {
    cursor: pointer;
}
.button:hover {
    text-decoration: underline;
}

.desc {
    background-color: black;
    border: solid white;
}
</style>