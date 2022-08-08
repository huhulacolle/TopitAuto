const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  pluginOptions: {
    electronBuilder: {
      externals: ['fluent-ffmpeg'],
      nodeIntegration: true,
      outputDir: 'build',
      builderOptions: {
        win: {
          target: 'portable',
          icon: 'build/icon.icns',
          asar: true,
          "extraFiles": {
            from: 'ffmpeg',
            to: './resources/app.asar.unpacked/ffmpeg'
          }
        }
      }
    }
  }
})
