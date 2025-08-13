

import { Picture} from '@element-plus/icons-vue'

const icons = {
    Picture
}

export default {
    install(app) {
        Object.keys(icons).forEach(key => {
            app.component(key, icons[key])
        })
    }
}
