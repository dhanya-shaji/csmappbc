
import * as utils from "../shared/utilities";
import { AuthType, createClient } from "webdav";


export type WebDavFile = {
    filename: string;
    basename: string;
    lastmod: string;
    size: number;
    type: string;
}

export class WebDavClient {
    private _client: any; // Adjust the type as needed
    private _url: string;
    private _user: any;
    private _product_import_directory = "/product_images/optimized_import/";
    private _download_directory = "./webdav/";
    private _fileSystem = require("fs");


    constructor() {
        this._url = process.env["WEBDAV_URL"];
        let user = process.env["WEBDAV_USER"];
        let pass = process.env["WEBDAV_PASS"];

         this._client = createClient(this._url, {
            authType: AuthType.Digest,
            username: user,
            password: pass
        });
    }



    // public listImagesInFolder=async (folderPath: any)=> {
    //     try {
    //       const contents = await  this._client.getDirectoryContents(folderPath);
    //       for (const item of contents) {
    //         if (item.type === "file" && item.filename.match(/\.(jpg|jpeg|png|gif)$/i)) {
    //           console.log("File Name:", item.filename);
    //           console.log("Size:", item.size);
    //           console.log("Last Modified:", item.lastmod);
    //           console.log("URL:", item.href);
    //           console.log("======================");
    //         }
    //       }
    //     } catch (error) {
    //       console.error("Error listing images:", error);
    //     }
    //   }







    getClient = () => { return this._client }

    getUser = () => { return this._user }

    getImageImportDirectory = () => { return this._product_import_directory }

    getImageImportList = async () => {
        return (await this._client.getDirectoryContents(this.getImageImportDirectory()));

    }


    public downloadImageByName = (fileName: string) => {
        let remoteFile = this._product_import_directory + fileName;
        let localFile = this._download_directory + fileName;
        utils.log(`[BigCommerce WebDAV] downloading file '${remoteFile}' to local directory '${localFile}'`);
        return new Promise((resolve, reject) => {
            try {
                this._client
                    .createReadStream(remoteFile)
                    .pipe(this._fileSystem.createWriteStream(localFile, { flags: 'w' }))
                    .on('finish', resolve)
                    .on('error', reject)
            } catch (error: any) {
                let axiosError: any = error;
                if (error.config) {
                    axiosError = {
                        code: error.code,
                        request: {
                            method: error.config?.method,
                            url: error.config?.url,
                            body: error.config?.data
                        },
                        response: (error.response) ? error.response?.data : null
                    }
                } else {
                    utils.log(axiosError);
                }
            }
        })
    }

    private downloadImage = (image: { basename: any; }) => {
        const name = image.basename
        return this.downloadImageByName(name);
    }

    public downloadImages = async (images: any[]) => {
        await utils.mapSequentially(images, this.downloadImage);
    }

    public exists = async (fileName: string): Promise<boolean> => {
        let remoteFile = this._product_import_directory + fileName;
        let exists: boolean = false

        try {
            exists = await this._client.exists(remoteFile)
            // console.log("remoteFile", remoteFile);
            // console.log("exists", exists);
        } catch (error: any) {
            let axiosError: any = error;
            if (error.config) {
                axiosError = {
                    code: error.code,
                    request: {
                        method: error.config?.method,
                        url: error.config?.url,
                        body: error.config?.data
                    },
                    response: (error.response) ? error.response?.data : null
                }
            } else {
                utils.log(axiosError);
            }
        }
        return exists;
    }

}
