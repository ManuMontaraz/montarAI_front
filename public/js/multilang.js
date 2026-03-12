let mtransCache = {}

function set_language(lang){
    set_cookie("lang",lang)
    mtrans()
}

function get_language(){
    return get_cookie("lang") || document.querySelector("html").getAttribute("lang") || 'en'
}

function mtrans(element, lang){
    const language = lang || get_language()

    const translate = (element,data)=>{
        if(typeof element === "string"){
            return data[element] || element
        }

        const split = element.getAttribute('mtrans').split(',')

        split.forEach(item => {
            const [attrPart, key] = item.trim().split("|")
            const [attr] = attrPart.split("=")

            if(attr === 'text'){
                element.textContent = data[key] || key
            } else {
                element.setAttribute(attr, data[key] || key)
            }
        });
    };

    const loadLang = () => {
        if (mtransCache[language]) {
            return Promise.resolve(mtransCache[language])
        }

        return fetch(`locales/${language}.json`)
            .then(r => r.json())
            .then(data => {
                mtransCache[language] = data
                return data
            })
    }

    return loadLang()
    .then(data => {
        if(!element){
            document.querySelectorAll('[mtrans]').forEach(el => translate(el,data))
            // Reemplazar placeholders {{name}} después de traducir
            document.querySelectorAll('[data-username]').forEach(el => {
                const userName = el.getAttribute('data-username')
                if (userName) {
                    el.textContent = el.textContent.replace('{{name}}', userName)
                }
            })
        } else {
            const result = translate(element,data)
            // Reemplazar placeholders {{name}} después de traducir
            if (typeof element !== 'string' && element.hasAttribute && element.hasAttribute('data-username')) {
                const userName = element.getAttribute('data-username')
                if (userName) {
                    element.textContent = element.textContent.replace('{{name}}', userName)
                }
            }
            return result
        }
    })
    .catch(error => console.error('Error loading language file:', error))
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector("#select_lang").value = get_language()
    mtrans()
});