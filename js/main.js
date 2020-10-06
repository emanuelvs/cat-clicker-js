
//[UTIL]
function node(tag, attr) {

    const element = document.createElement(tag);
    for (const key in attr) {
        if (attr.hasOwnProperty(key)) {
            if(key === "class") {
                element.classList.add(attr[key])
            }
            else {
                element[key] = attr[key];
            }
        }
    }
    return element;
}

function wrap(parent, childs) {

    childs.forEach(element => {
        parent.appendChild(element)
    });
    return parent;
}

//[MAIN]
(function() {
    
    const repository = new Repository();

    const model = {
        init() {
            repository.init()
        },
        getCats: () => repository.cats.get(),
        setCats: (data) => repository.cats.set(data)
    }
    const controller = {
        init: () => {
            model.init()
            view.init()
            listView.init()
        },
        addCat(url, name) {
            const cat = {
                id: name + (Math.floor(Math.random() * 100))+1,
                url,
                name,
                clicks: 0
            }
            const cats = [...model.getCats(), cat]
            model.setCats(cats)

            listView.render()
            view.render(this.currentCat())
        },
        selectCat(cat){
            view.render(this.currentCat(cat));
        },
        currentCat(cat){
            if(!cat){
                return model.getCats()[0]
            }else {
                return model.getCats().find(c => c.id == cat.id)
            }
        },
        cats() {
            return model.getCats();
        },
        handleCatClick(cat) {
            let cats = model.getCats();
            cats.forEach(elem => {
                if(elem.id === cat.id) {
                    elem.clicks++;
                }
            });
            model.setCats(cats)
            view.render(this.currentCat(cat))
        },
        deleteCat(cat) {
            const cats = this.cats().filter(c => c.id !== cat.id);
            model.setCats(cats);
            listView.render();
            view.render(this.currentCat())
        }
    }
    const view = {
        init() {
            this.deleteCatBtn = document.querySelector(".delete-cat-btn");
            this.catPhoto = document.querySelector(".cat-photo");
            this.catName = document.querySelector(".cat-name");
            this.catClicks = document.querySelector("#cat-clicks");
            
            this.catPhoto.addEventListener("click", () => {
                controller.handleCatClick(this.currentCat)
            })
            this.deleteCatBtn.addEventListener("click", () => {
                controller.deleteCat(this.currentCat)
            })

            this.render(controller.currentCat());
        },
        render(currentCat) {
            
            this.currentCat = currentCat
            this.catName.textContent = this.currentCat.name;
            this.catClicks.textContent = this.currentCat.clicks;
            this.catPhoto.src = this.currentCat.url;
        }
    }

    const listView = {
        init() {

            this.catList = document.querySelector(".cat-list");
            this.addBtn = document.querySelector(".add-cat-btn")

            this.addBtn.addEventListener("click", () => {
                modalView.init()
            });

            this.render()
        },
        render() {
            this.catList.innerHTML = ""
            
            const catList = controller.cats();
            wrap(this.catList, catList.map(cat => {

                const card = node("div", { class: "cat-card" });
                card.addEventListener("click", () => {
                    controller.selectCat(cat)
                })

                const img = node("img", { src: cat.url, class: "cat-card-img" })
                const name = node("h4", { innerHTML: cat.name })
                return wrap(card, [img, name]);
            }))
        }
    }

    const modalView = {
        init() {

            this.modalTitle = node("h3", {
                textContent: "Add Cat",
                class: "modal__title"
            })

            this.imageLabel = node("label", {
                innerHTML: "Cat Image Url"
            })
            this.imageUrl = node("input", {
                class: "input",
                name: "image",
                id: "image",
                placeholder: "Put image url here!"
            });
            

            this.nameLabel = node("label", {
                innerHTML: "Cat Name"
            })
            this.catName = node("input", {
                class: "input",
                name: "name",
                id: "name",
                placeholder: "Put the cat name"
            });

            this.submit = node("button", { innerHTML: "Save",  class: "submitBtn"})
            this.submit.addEventListener("click", () => {
                controller.addCat(this.imageUrl.value, this.catName.value)
                this.destroy()
            })


            this.closeBtn = node("div", {
                class: "closeModal",
                innerHTML: '<i class="fas fa-times"></i>'
            })
            this.closeBtn.addEventListener("click", () => {
                this.destroy()
            })

            this.card = node("div", { class: "card" })
            this.container  = node("div", { class: "modal" });

            this.render()
        },
        render() {
            const ui = document.querySelector("body");
            
            wrap(this.card, [
                this.modalTitle,
                this.imageUrl,
                this.imageLabel,
                this.catName
            ])
            wrap(this.container, [
                wrap(this.card, [
                    this.closeBtn,
                    this.imageLabel, this.imageUrl,
                    this.nameLabel, this.catName,
                    this.submit
                ])
            ])
            
            ui.insertBefore(this.container, ui.firstChild);
        },
        destroy() {
            this.container.remove();
        }
    }
    controller.init();
})()

//DATA PERSISTENCE
function Repository() {
    
    const repository = {
        
        cats: {
            key: "cats",
            defaultValue: [],
            set: (value) => repository.set("cats", value),
            get: () => repository.get("cats")
        },
        init() {

            if(!localStorage[this.cats.key]){
                localStorage[this.cats.key] = this.cats.defaultValue;
            }
        },
        set(key, data) {
            localStorage[key] = JSON.stringify(data)
        },
        get(key) {
            return JSON.parse(localStorage[key]);
        }
    }
    return repository;
}