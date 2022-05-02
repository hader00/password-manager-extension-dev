import {Component} from "react";
import ViewType from "./shared/other/ViewType";
import {fillCredentials, openTab} from "./contentScript";

class CustomComponent extends Component {
    /**
     * default onChange function
     */
    onChange = (e) => {
        this.setState({[e.target.name]: e.target.value});
    };

    /**
     * togglePasswordType function
     * changes password field from "text" to "password" and vice-versa
     *
     * @param   name   password field name
     */
    togglePasswordType = (name) => {
        if (this.state[name] === "password") {
            this.setState({[name]: "text"})
        } else {
            this.setState({[name]: "password"})
        }
    }
    /**
     * handleViewChange function
     * change view in App class
     *
     * @param   location            view to be changed
     */
    handleViewChange = (location) => {
        this.props.changeParentsActiveView(location);
    }

    /**
     * isEmpty function
     * for all possible empty/null/undefined cases
     */
    isEmpty = (item) => {
        return item === "" || item === null || item === "null" || item === undefined || item === "undefined";
    }

    /**
     * setStateFromResponse function
     * sets states according the messages from main application
     *
     * @param   evt   response from ws server
     */
    setStateFromResponse = (evt) => {
        const response = JSON.parse(evt.data)
        if (response.channel === "logout:set") {
            this.setState({activeView: response.defaultLoginView, timeout: null});
        }
        if (response.channel === "defaultView:response") {
            this.setState({activeView: response.defaultView, timeout: response.timeout});
        }
        if (response.channel === "passwords:fetchResponse") {
            this.setState({passwords: response.response});
        }
        if (response.channel === "login:response") {
            if (response.response === true) {
                this.setState({activeView: ViewType.passwordListView});
            }
        }
        if (response.channel === "passwords:addResponse") {
            if (response.addSuccess === true) {
                this.popView();
            }
        }
        if (response.channel === "passwords:deleteResponse") {
            if (response.deleteSuccess === true) {
                this.popView();
            }
        }
        if (response.channel === "passwords:updateResponse") {
            if (response.updateSuccess === true) {
                this.popView();
            }
        }
    }
}


class PasswordItemViewController extends CustomComponent {
    /**
     * openBrowser function
     * Open browser tab with current password's URL
     */
    openBrowser = async () => {
        openTab(this.state.url);
    }

    /**
     * passwordItemViewDidMount function
     * start after mount of passwordItem class
     */
    passwordItemViewDidMount = () => {
        window.scrollTo(0, 0);
        if (!this.props.addingNewItem) {
            if (this.state.url !== "" && this.state.url !== undefined) {
                this.checkURL();
            }
            if (this.state.password !== "" && this.state.password !== undefined) {
                let that = this
                this.decryptPassword(this.state.password).then(password => {
                    that.setState({password: password})
                    that.props.setPasswordForFill(password)
                    that.props.revertWSonMessage()
                });
            }
        }
    }
    /**
     * generatePassword function
     * get new generated password from electron
     *
     * @param  length  a number of desired length
     * @param  specialCharacters  a bool if special characters should be used
     * @param  numbers  a bool if special numbers should be used
     * @param  lowerCase  a bool if special lowercase letters should be used
     * @param  upperCase  a bool if special uppercase letters should be used
     */
    generatePassword = (length, specialCharacters, numbers, lowerCase, upperCase) => {
        this.props.ws.send(JSON.stringify({
            channel: "password:generate",
            length: length,
            specialCharacters: specialCharacters,
            numbers: numbers,
            lowerCase: lowerCase,
            upperCase: upperCase
        }));
        // receiver
        let that = this
        this.props.ws.onmessage = function (evt) {
            const response = JSON.parse(evt.data)
            if (response.channel === "password:generateResponse") {
                if (response.password.length > 0) {
                    that.setState({password: response.password})
                }
                that.props.revertWSonMessage();
            }
        }
    }

    /**
     * passwordItemDidMount function
     * start after mount of passwordItem class
     */
    passwordItemDidMount = () => {
        this.checkURL();
        if (this.props.setCurrentPasswordForFill) {
            if (this.props.password.password !== "" && this.props.password.password !== undefined) {
                let that = this
                this.decryptPassword(this.props.password.password).then(decryptedPassword => {
                    that.setState({decryptedPassword: decryptedPassword})
                    that.props.revertWSonMessage()
                });
            }
        }
    }

    /**
     * decryptPassword function
     * decrypt currently opened password for password item
     *
     * @param   encryptedPassword              an encrypted password
     */
    decryptPassword = async (encryptedPassword) => {
        this.props.ws.send(JSON.stringify({channel: "password:decrypt", password: encryptedPassword}));
        // receiver
        return await new Promise((resolve, reject) => {
            let password = ""
            this.props.ws.onmessage = function (evt) {
                const result = JSON.parse(evt.data)
                if (result.channel === "password:decryptResponse") {
                    password = result.password
                }
                resolve(password)
            }
        });
    }

    /**
     * popView function
     * change view in App class
     */
    popView = () => {
        this.props.changeParentsActiveView(ViewType.passwordListView);
    }

    /**
     * addPassword function
     * send new password to electron to be encrypted and stored on server or in local database
     */
    addPassword = () => {
        if (!this.state.title?.length > 0) {
            this.toggleTitleError();
            return;
        }
        let title = this.state.title;
        let description = this.state.description;
        let url = this.state.url;
        let username = this.state.username;
        let password = this.state.password;
        this.setState({saveLoading: true});
        this.props.ws.send(JSON.stringify({
            channel: "passwords:add",
            title: title,
            description: description,
            url: url,
            username: username,
            password: password
        }));
    }

    /**
     * updatePassword function
     * update existing password on server or in local database
     */
    updatePassword = () => {
        let id = this.state.id;
        let title = this.state.title;
        let description = this.state.description;
        let url = this.state.url;
        let username = this.state.username;
        let password = this.state.password;
        this.props.ws.send(JSON.stringify({
            channel: "passwords:update",
            id: id,
            title: title,
            description: description,
            url: url,
            username: username,
            password: password
        }));
    }

    /**
     * deletePassword function
     * delete existing password on server or in local database
     */
    deletePassword = () => {
        let id = this.state.id;
        this.props.ws.send(JSON.stringify({channel: "passwords:delete", id: id}));
    }
    /**
     * fillCredentials function
     * inject active page and fill credentials
     */
    fillCredentials = (url, username, password) => {
        fillCredentials(url, username, password)
    }
}

class PasswordListViewController extends CustomComponent {
    //
    waitForExportItems = () => {
        // empty, error handling
    }
    /**
     * passwordListViewDidMount function
     * operations for passwordlistview
     */
    passwordListViewDidMount = () => {
        this.props.fetchAllPasswords();
        this.autoFetch().then(r => {
            return r
        })
    }
}


class PasswordFieldController extends CustomComponent {
    /**
     * copy function clears clipboard on focus
     *
     * saves value to clipboard and starts timer for clipboard clear
     *
     @param   text   text to be saved to clipboard
     */
    copy = async (text) => {
        let that = this
        await this.askForTimeout().then(async timeout => {
            that.props.revertWSonMessage()
            await navigator.clipboard.writeText(text);
            if (timeout !== -1) {
                setTimeout(async () => {
                    await navigator.clipboard.writeText("").catch(error => {
                        that.clearClipboardOnFocus()
                    });
                }, timeout);
            }
        })

    }
    /**
     * askForTimeout function
     * Fetch clipboard clear timeout
     */
    askForTimeout = async () => {
        this.props.ws.send(JSON.stringify({channel: "security:get"}));
        return await new Promise((resolve, reject) => {
            let timeout = ""
            this.props.ws.onmessage = function (evt) {
                const response = JSON.parse(evt.data)
                if (response.channel === "security:response") {
                    if (response?.response !== null) {
                        timeout = parseInt(response?.response?.clearTimeout)
                        if (timeout !== -1 && timeout !== null) {
                            timeout = timeout * 1000
                        }
                        if (timeout === null) {
                            timeout = 10 * 1000; //10 seconds
                        }
                    }
                }
                resolve(timeout)
            }
        });
    }
}

export {
    PasswordItemViewController,
    PasswordListViewController,
    PasswordFieldController,
    CustomComponent
}