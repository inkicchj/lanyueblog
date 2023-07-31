
function Pagination(element, options) {
    this.url = options.url;
    this.method = options.method?options.method:"post";
    this.element = element;
    this.itemNum = options.itemNum;

    this.pagination = {
        total: 1,
        total_page: 1,
        page: options.page,
        page_size: 1,
    }

    this.param = options.param

    this.response = null

    this.init = () => {
        this.get();
    }

    this.get = () => {
        console.log(this.pagination.page);
        let url;
        if (this.pagination.page>0) {
            url = this.url + `?page=${this.pagination.page}`
        }
        axios({
            url: url,
            method: this.method,
            data: this.param
        }).then(res => {
            this.pagination.total_page = res.data.data.total_page;
            this.pagination.page = res.data.data.page;
            this.pagination.total = res.data.data.total;
            this.pagination.page_size = res.data.data.page_size;
            this.generate();
            this.response = res;
            if (options.onSuccess) {
                options.onSuccess(this.response)
            }
        }).catch(err => {
            if (options.onError) {
                options.onError(err)
            }
        })
    }

    this.pageNext = () => {
        if (this.pagination.page < this.pagination.total_page) {
            this.pagination.page++
            this.get();
        }
    }

    this.pagePrev = () => {
        if (this.pagination.page > 1) {
            this.pagination.page--;
            this.get();
        }
    }

    this.pageGo = (page) => {
        if (page>=1&&page<=this.pagination.total_page) {
            this.pagination.page = page;
            this.get();
        }
    }

    this.generate = () => {
        let that = this;
        let pages = that.pagination.total_page;
        let cur = that.pagination.page;
        if (document.getElementById("pagination-main")){
            document.getElementById("pagination-main").remove();
        }
        let page_main = document.createElement("div");
        page_main.style.display = "flex";
        page_main.style.justifyContent = "start";
        page_main.style.padding = "10px";
        page_main.id = "pagination-main"

        let page_prev = document.createElement("button");
        page_prev.classList.add("pagination-btn");
        page_prev.innerText = "<";
        if (cur!==1) {
            page_prev.disabled = false;
            page_prev.id = "pagination-prev";
            page_prev.addEventListener("click", function (e) {
                that.pagePrev();
            })
        } else {
            page_prev.disabled = true;
        }




        page_main.appendChild(page_prev);


        if (pages <= that.itemNum) {
            for (let i=1;i<=pages;i++) {
                let page_num = document.createElement("button");
                page_num.classList.add("pagination-btn");
                page_num.id = `pagination-${i}`;
                page_num.innerText = `${i}`;
                if (cur === i) {
                    page_num.classList.add("pagination-btn-active");
                }
                page_num.addEventListener("click", function (e) {
                    that.pageGo(i);
                })
                page_main.appendChild(page_num);
            }
        }
        if (pages > that.itemNum) {
            let page_list = [];
            for (let i=1;i<=pages;i++){
                page_list.push(i);
            }
            let center = parseInt(that.itemNum/2+1);
            let show_pages;
            if (cur<center) {
                show_pages = page_list.slice(0, that.itemNum);
            } else if(cur >= center && cur <= pages-center+1) {
                show_pages = page_list.slice(cur-center, cur+center-1);
            } else if(cur>pages-center+1) {
                show_pages = page_list.slice(pages-that.itemNum, pages);
            }
            console.log(show_pages);
            for (let i=0;i<show_pages.length;i++) {
                let page_num = document.createElement("button");
                page_num.classList.add("pagination-btn");
                page_num.id = `pagination-${show_pages[i]}`;
                page_num.innerText = `${show_pages[i]}`;
                if (cur === show_pages[i]) {
                    page_num.classList.add("pagination-btn-active");
                }
                page_num.addEventListener("click", function (e) {
                    that.pageGo(show_pages[i]);
                })
                page_main.appendChild(page_num);
            }

        }

        let page_next = document.createElement("button");
        page_next.classList.add("pagination-btn");
        page_next.innerText = ">";
        if (cur!==pages) {
            page_next.disabled = false;
            page_next.id = "pagination-next";
            page_next.addEventListener("click", function (e) {
                that.pageNext();
            })
        } else {
            page_next.disabled = true;
        }


        page_main.appendChild(page_next)

        document.getElementById(that.element).appendChild(page_main);

    }
}