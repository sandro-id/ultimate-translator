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

const translateInput = document.getElementById('translate_input')
translateInput.addEventListener('change', (event) => {
    ipcRenderer.send('controls-input-change', translateInput.value)
})

ipcRenderer.on('focus-input', (event, value) => {
    translateInput.focus()
    if (value) {
        translateInput.value = value
    }
})