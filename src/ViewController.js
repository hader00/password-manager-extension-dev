import {Component} from "react";
import ViewType from "./shared/other/ViewType";

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
    setStateFromResponse = (evt) => {
        const response = JSON.parse(evt.data)
        console.log(response)
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
        if (response.channel === "password:generateResponse") {
            if (response.password.length > 0) {
                this.setState({password: response.password})
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
        if (response.channel === "security:response") {
            if (response?.response !== null) {
                let timeout = parseInt(response?.response?.clearTimeout)
                if (timeout !== -1 && timeout !== null) {
                    timeout = timeout * 1000
                }
                if (timeout === null) {
                    timeout = 10 * 1000; //10 seconds
                }
                this.setState({timeout: timeout})
                this.writeToClipboard().then(r => {
                    return r
                });
            }
        }
        if (response.channel === "password:decryptResponse") {
            console.log("password:decryptResponse from app")
            let password = response.password
            if (password !== null) {
                console.log(password)
                console.log("typeof this.props.setCurrentPasswordForFill === \"function\" || typeof this.props.setPasswordForFill === \"function\"")
                this.setState({currentDecryptedPassword: password}, () => {
                });
                this.setPasswordForFill(password)
            }
        }
    }
}


class PasswordItemViewController extends CustomComponent {
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

    generatePassword = (length, specialCharacters, numbers, lowerCase, upperCase) => {
        this.props.ws.send(JSON.stringify({
            channel: "password:generate",
            length: length,
            specialCharacters: specialCharacters,
            numbers: numbers,
            lowerCase: lowerCase,
            upperCase: upperCase
        }));
    }

    passwordItemDidMount = () => {
        this.checkURL();
        if (this.props.setCurrentPasswordForFill !== undefined) {
            if (this.props.password.password !== "" && this.props.password.password !== undefined) {
                let that = this
                this.decryptPassword(this.props.password.password).then(decryptedPassword => {
                    that.setState({decryptedPassword: decryptedPassword})
                    that.props.setCurrentPasswordForFill(decryptedPassword)
                    that.props.revertWSonMessage()
                });
            }
        }
    }
    //
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

    //
    popView = () => {
        this.props.changeParentsActiveView(ViewType.passwordListView);
    }
    //
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
    //
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
    //
    deletePassword = () => {
        let id = this.state.id;
        this.props.ws.send(JSON.stringify({channel: "passwords:delete", id: id}));
    }
}

class PasswordListViewController extends CustomComponent {
    passwordListViewDidMount = () => {
        this.props.fetchAllPasswords();
        this.autoFetch().then(r => {
            return r
        })
    }
}


class PasswordFieldController extends CustomComponent {
    copy = async (text) => {
        this.setState({text: text})
        this.props.ws.send(JSON.stringify({channel: "security:get"}));
    }

    writeToClipboard = async () => {
        await navigator.clipboard.writeText(this.state.text);
        if (this.state.timeout !== -1) {
            setTimeout(async () => {
                await navigator.clipboard.writeText("").catch(error => {
                    this.clearClipboardOnFocus()
                });
            }, this.state.timeout);
        }
    }
}

export {
    PasswordItemViewController,
    PasswordListViewController,
    PasswordFieldController,
    CustomComponent
}