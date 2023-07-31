function FileUpload(elemt, options) {

    this.files = [];
    this.fileIds = []
    this.queue = [];

    this.input = document.getElementById(elemt);

    this.maxFileSize = this.input.dataset.maxFileSize?this.input.dataset.maxFileSize:null;
    this.maxFiles = this.input.dataset.maxFiles?this.input.dataset.maxFiles:null;
    this.limit = this.input.dataset.maxParallel?this.input.dataset.maxParallel:2;
    this.formName = this.input.name;

    this.id = md5(elemt);

    this.upload = {
        url: options.upload.url,
        method: options.upload.method,
    };

    this.task = [];

    // 文件状态 WAITING 1, UPLOADING 2, SUCCESS 3, ERROR 4

    this.WAITING = 1;
    this.UPOADING = 2;
    this.SUCCESS = 3;
    this.ERROR = 4;
    this.Failed = 5;

    this.onSuccess = function (file, cb) {
        cb(file)
    };

    this.addResFiles = function (fileList) {

        for (let i=0;i<fileList.length;i++) {
            let fileId = md5(`${fileList[i].name}${fileList[i].size}${fileList[i].preview}`)
            let file_alone = {
                file: null,
                fileType: null,
                fileSize: fileList[i].size,
                fileName: fileList[i].name,
                fileId: fileId,
                serverRes: fileList[i],
                status: this.SUCCESS,
            };
            this.files.push(file_alone);
            this.createItem(file_alone);
            document.getElementById(`upload-status-${this.id}-${fileId}`).innerText = "已上传";
            document.getElementById(`upload-${this.id}-${fileId}`).style.background = "#0DAD51";
            document.getElementById(`upload-loader-${this.id}-${fileId}`).style.animationPlayState = "paused";
            document.getElementById(`upload-loader-${this.id}-${fileId}`).style.display = "none";
            document.getElementById(`upload-remove-${this.id}-${fileId}`).style.display = "inline-block";
            let that = this;
            document.getElementById(`upload-remove-${this.id}-${fileId}`).addEventListener("click", function (event) {
                document.getElementById(`upload-loader-${that.id}-${fileId}`).style.animationPlayState = "";
                document.getElementById(`upload-loader-${that.id}-${fileId}`).style.display = "inline-block";
                document.getElementById(`upload-remove-${that.id}-${fileId}`).style.display = "none";
                if (file_alone.status !== that.ERROR) {
                    if (options.onRemove) {
                        options.onRemove(file_alone);
                    }
                }
                let node = document.getElementById(`upload-${that.id}-${fileId}`);
                node.remove();
                for (let i=0;i<that.files.length;i++) {
                    if (that.files[i].fileId === fileId) {
                        that.files.splice(i, 1);
                    }
                }
            })
            document.getElementById(`upload-${this.id}-${fileId}`).addEventListener("click", function (event) {
                if (!event.target.className.includes("upload-remove")) {
                    if(options.onClick) {
                        options.onClick(file_alone);
                    }
                }

            })
        }
    }

    this.destroy = () => {
        let main = document.getElementById(`upload-main-${this.id}`);
        main.remove();
    }

    this.hidden = () => {
        document.getElementById(`upload-main-${this.id}`).style.display = "none";
    }

    this.visible = () => {
        document.getElementById(`upload-main-${this.id}`).style.display = "block";
    }


    this.createDiv = () => {
        let main = document.createElement("div");
        main.classList.add("upload-main");
        main.id = `upload-main-${this.id}`;
        let upload_bar = document.createElement("div");
        upload_bar.classList.add("upload-bar");
        upload_bar.id = `upload-bar-${this.id}`;

        let upload_btn = document.createElement("div");
        upload_btn.classList.add("upload-btn");
        upload_btn.id = `upload-btn-${this.id}`

        let upload_link;
        if (options.label) {
            upload_link = options.label
        } else {
            upload_link = `<span>上传文件</span>`
        }

        upload_bar.appendChild(upload_btn);
        main.appendChild(upload_bar);

        let parent = this.input.parentNode;
        parent.appendChild(main);

        document.getElementById(`upload-btn-${this.id}`).innerHTML = upload_link;
        let that = this;
        that.input.style.display = "none";
        document.querySelector(`#upload-btn-${this.id} span`).addEventListener("click", function (e) {
            that.input.click();
        })
    }

    this.createItem = (f) => {

        let main = document.getElementById(`upload-main-${this.id}`);

        let card = document.createElement("div");
        card.classList.add("upload-card");
        card.id = `upload-${this.id}-${f.fileId}`

        let info = document.createElement("div");
        info.classList.add("upload-info");

        let name = document.createElement("div");
        name.classList.add("upload-name");

        let span_name = document.createElement("span");
        span_name.innerText = f.fileName;

        name.appendChild(span_name);

        let size = document.createElement("div");
        size.classList.add("upload-size");

        let span_size = document.createElement("span");
        span_size.innerText = `${f.fileSize/1024/1024>=1?(f.fileSize/1024/1024).toFixed(2)+'M':(f.fileSize/1024).toFixed(2)+'KB'}`;

        size.appendChild(span_size);

        info.appendChild(name);
        info.appendChild(size);

        card.appendChild(info);

        let func = document.createElement("div");
        func.classList.add("upload-func");

        let tip = document.createElement("div");
        tip.classList.add("upload-tip");
        tip.id = `upload-status-${this.id}-${f.fileId}`;
        tip.innerText = "等待上传";

        let status = document.createElement("div");
        status.classList.add("upload-status");

        let loader_bar = document.createElement("div");
        loader_bar.classList.add("upload-loader-bar");
        loader_bar.id = `upload-loader-bar-${this.id}-${f.fileId}`;

        let loader = document.createElement("div");
        loader.classList.add("upload-loader");
        loader.id = `upload-loader-${this.id}-${f.fileId}`

        let delete_btn = document.createElement("div");
        delete_btn.classList.add("upload-remove");
        delete_btn.id = `upload-remove-${this.id}-${f.fileId}`;
        delete_btn.innerText = "—";
        delete_btn.style.display = "none";

        loader_bar.appendChild(loader);
        loader_bar.appendChild(delete_btn);
        status.appendChild(loader_bar);
        func.appendChild(tip);
        func.appendChild(status);

        card.appendChild(func);

        main.appendChild(card);



    }

    this.error = (msg, f) => {
        document.getElementById(`upload-status-${this.id}-${f.fileId}`).innerText = `${msg}`;
        document.getElementById(`upload-${this.id}-${f.fileId}`).style.background = "#f6416c";
        document.getElementById(`upload-loader-${this.id}-${f.fileId}`).style.animationPlayState = "paused";
        document.getElementById(`upload-loader-${this.id}-${f.fileId}`).style.display = "none";
        document.getElementById(`upload-remove-${this.id}-${f.fileId}`).style.display = "inline-block";
    }

    this.start = () => {
        this.createDiv();

        this.input.addEventListener("change", (event) => {
            let fs = event.target.files;
            console.log(fs);
            for (let i = 0; i < fs.length; i++) {

                let f = fs[i];
                this.files.forEach(s => {
                    this.fileIds.push(s.fileId);
                });
                let fileId = md5(`${f.name}${f.size}${f.type}`);
                if (!this.fileIds.includes(fileId)) {
                    let file_alone = {
                        file: f,
                        fileType: f.type,
                        fileSize: f.size,
                        fileName: f.name,
                        fileId: fileId,
                        serverRes: null,
                        status: this.WAITING,
                    };
                    if (this.maxFiles) {
                        if (this.files.length < this.maxFiles) {
                            this.files.push(file_alone);
                            this.createItem(file_alone);
                            if (this.maxFileSize) {
                                if (file_alone.fileSize > this.maxFileSize) {
                                    file_alone.status = this.ERROR;
                                    this.error("附件太大了", file_alone);
                                }
                            }
                            let that = this;
                            document.getElementById(`upload-remove-${this.id}-${file_alone.fileId}`).addEventListener("click", function (event) {
                                document.getElementById(`upload-loader-${that.id}-${file_alone.fileId}`).style.animationPlayState = "";
                                document.getElementById(`upload-loader-${that.id}-${file_alone.fileId}`).style.display = "inline-block";
                                document.getElementById(`upload-remove-${that.id}-${file_alone.fileId}`).style.display = "none";
                                if (file_alone.status !== that.ERROR) {
                                    if (options.onRemove) {
                                        options.onRemove(file_alone);
                                    }
                                }
                                let node = document.getElementById(`upload-${that.id}-${file_alone.fileId}`);
                                node.remove();
                                for (let i=0;i<that.files.length;i++) {
                                    if (that.files[i].fileId === file_alone.fileId) {
                                        that.files.splice(i, 1);
                                    }
                                }
                            })

                        }
                    } else {
                        this.files.push(file_alone);
                        this.createItem(file_alone);
                        if (file_alone.fileSize > this.maxFileSize) {
                            file_alone.status = this.ERROR;
                            this.error("附件太大了", file_alone);
                        }
                        let that = this;
                        document.getElementById(`upload-remove-${this.id}-${file_alone.fileId}`).addEventListener("click", function (event) {
                            document.getElementById(`upload-loader-${that.id}-${file_alone.fileId}`).style.animationPlayState = "";
                            document.getElementById(`upload-loader-${that.id}-${file_alone.fileId}`).style.display = "inline-block";
                            document.getElementById(`upload-remove-${that.id}-${file_alone.fileId}`).style.display = "none";
                            if (file_alone.status !== that.ERROR) {
                                if (options.onRemove) {
                                    options.onRemove(file_alone);
                                }
                            }
                            let node = document.getElementById(`upload-${that.id}-${file_alone.fileId}`);
                            node.remove();
                            for (let i=0;i<that.files.length;i++) {
                                if (that.files[i].fileId === file_alone.fileId) {
                                    that.files.splice(i, 1);
                                }
                            }
                        })
                    }
                }
                this.fileIds = [];

            }

            console.log(this.files);
            console.log(this.fileIds);

            this.files.forEach(f => {

                if (f.status === this.WAITING) {
                    this.queue.push(f);
                }
            })

            let counter = 0;
            while (counter<this.limit && counter<this.queue.length) {
                counter++;

                let upload_queue = (item) => {
                    let file = item.file;
                    let fileId = item.fileId;
                    for (let j=0;j<this.files.length;j++) {
                        if (this.files[j].fileId === fileId) {
                            this.files[j].status = this.UPOADING;
                            document.getElementById(`upload-status-${this.id}-${this.files[j].fileId}`).innerText = "上传中";
                        }
                    }
                    let forms = new FormData();
                    forms.append(this.formName, file);
                    axios({
                        url: this.upload.url,
                        method: this.upload.method,
                        data: forms
                    }).then(res => {

                        if (res.data.code === 200) {
                            let f;
                            for (let j=0;j<this.files.length;j++) {
                                if (this.files[j].fileId === fileId) {
                                    this.files[j].status = this.SUCCESS;
                                    this.files[j].serverRes = res.data.data;
                                    f = this.files[j];
                                }
                            }
                            document.getElementById(`upload-${this.id}-${f.fileId}`).addEventListener("click", function (event) {
                                if (!event.target.className.includes("upload-remove")) {
                                    if(options.onClick) {
                                        options.onClick(f);
                                    }
                                }

                            })
                            document.getElementById(`upload-status-${this.id}-${f.fileId}`).innerText = "上传完成";
                            document.getElementById(`upload-${this.id}-${f.fileId}`).style.background = "#0DAD51";
                            document.getElementById(`upload-loader-${this.id}-${f.fileId}`).style.animationPlayState = "paused";
                            document.getElementById(`upload-loader-${this.id}-${f.fileId}`).style.display = "none";
                            document.getElementById(`upload-remove-${this.id}-${f.fileId}`).style.display = "inline-block";
                            if (options.onSuccess) {
                                this.onSuccess(f, options.onSuccess);
                            }



                        }
                        if (res.data.code === 410) {
                            let f;
                            for (let j=0;j<this.files.length;j++) {
                                if (this.files[j].fileId === fileId) {
                                    this.files[j].status = this.ERROR;
                                    this.files[j].serverRes = res.data.data;
                                    f = this.files[j];
                                }
                            }
                            this.error(res.data.msg, f);
                        }

                        counter++;
                        if (counter<this.queue.length+1) {
                            upload_queue(this.queue[counter-1]);
                        } else if (counter===this.queue.length+1) {
                            this.queue = [];
                            console.log("上传完成");
                        }

                    }).catch(err => {
                        console.log(err);
                        let f;
                        for (let j=0;j<this.files.length;j++) {
                            if (this.files[j].fileId === fileId) {
                                this.files[j].status = this.ERROR;
                                f = this.files[j];
                            }
                        }
                        this.error("上传时出错", f);
                        counter++;
                        if (counter<this.queue.length+1) {
                            upload_queue(this.queue[counter-1]);
                        } else if (counter===this.queue.length+1) {
                            this.queue = [];
                            console.log("上传完成");
                        }
                    })
                }
                upload_queue(this.queue[counter-1]);
            }

        })
    }
}
