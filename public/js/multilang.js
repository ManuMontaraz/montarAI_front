function set_language(lang){
    set_cookie("lang",lang)
    mtrans()
}

function mtrans(element){
    const language = get_cookie("lang") || document.querySelector("html").getAttribute("lang") || 'en';

    const translate = (element,data)=>{
        const split = element.getAttribute('mtrans').split(',');

        split.forEach(item => {
            const [attrPart, key] = item.trim().split("|");
            const [attr, value] = attrPart.split("=");
            
            if(attr === 'text'){
                element.textContent = data[key] || key;
            } else {
                element.setAttribute(attr, data[key] || key);
            }
        });
    }
    
    fetch(`locales/${language}.json`)
    .then(response => response.json())
    .then(data => {
        if(!element){
            document.querySelectorAll('[mtrans]').forEach(element => {
                translate(element,data)
            })
        }else{
            translate(element,data)
        }
    })
    .catch(error => console.error('Error loading language file:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    mtrans()
});