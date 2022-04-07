import {Component} from "react";
import ViewType from "./shared/other/ViewType";

class PasswordItemViewController extends Component {
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
        // receiver
        let that = this;
        this.props.ws.onmessage = function (evt) {
            const result = JSON.parse(evt.data)
            if (result.channel === "passwords:addResponse") {
                if (result.addSuccess === true) {
                    that.popView();
                } else {
                }
            }
        }
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
        // receiver
        let that = this;
        this.props.ws.onmessage = function (evt) {
            const result = JSON.parse(evt.data)
            if (result.channel === "passwords:updateResponse") {
                if (result.updateSuccess === true) {
                    that.popView();
                } else {

                }
            }
        }
    }
    //
    deletePassword = () => {
        let id = this.state.id;
        this.props.ws.send(JSON.stringify({channel: "passwords:delete", id: id}));
        // receiver
        let that = this;
        this.props.ws.onmessage = function (evt) {
            const result = JSON.parse(evt.data)
            if (result.channel === "passwords:deleteResponse") {
                if (result.deleteSuccess === true) {
                    that.popView();
                } else {
                }
            }
        }
    }
}

class PasswordListViewController extends Component {

}


class PasswordFieldController extends Component {
    getDefaultSecurity = async () => {
        this.props.ws.send(JSON.stringify({channel: "security:get"}));
        // receiver
        return await new Promise((resolve, reject) => {
            let timeout = null
            this.props.ws.onmessage = function (evt) {
                const result = JSON.parse(evt.data)
                if (result.channel === "security:response") {
                    if (result?.response !== null) {
                        timeout = parseInt(result?.response?.clearTimeout)
                        if (timeout !== -1) {
                            timeout = timeout * 1000
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
    PasswordFieldController
}