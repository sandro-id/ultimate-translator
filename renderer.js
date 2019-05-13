const {
    ipcRenderer
} = require('electron')


const controlButtons = document.querySelectorAll('#controls button')
controlButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
        controlButtons.forEach((button) => {
            button.classList.remove('active')
        })
        event.currentTarget.classList.add('active')
        ipcRenderer.send('controls-set-active-windows', event.currentTarget.id)
    })
})