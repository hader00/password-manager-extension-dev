import {Component} from "react";
import ViewType from "./shared/other/ViewType";

class LocalLoginViewController extends Component {
    selectFile = () => {
        document.getElementById('hiddenField').addEventListener('click', (e) => {
            e.preventDefault();
            this.props.ws.send(JSON.stringify({channel: "selectDatabase:get"}));
        })
        // receiver
        let that = this
        this.props.ws.onmessage = function (evt) {
            const response = JSON.parse(evt.data)
            if (response.channel === "selectDatabase:response") {
                that.setState({location: response.selectedFile});
            }
        }
    }
    //
    handleViewChange = (location) => {
        this.props.changeParentsActiveView(location);
    }
    //
    submitLogin = (password, location) => {
        this.props.ws.send(JSON.stringify({channel: "localLogin:login", password: password, location: location}));
        // receiver
        let that = this
        this.props.ws.onmessage = function (evt) {
            const result = JSON.parse(evt.data)
            if (result.channel === "localLogin:response") {
                if (result.localLoginSuccess === true) {
                    that.handleViewChange(ViewType.passwordListView);
                } else {
                    // todo warning
                }
            }
        }
    }
}

class LocalRegistrationViewController extends Component {
    selectFolder = () => {
        document.getElementById('hiddenField').addEventListener('click', (e) => {
            e.preventDefault();
            this.props.ws.send(JSON.stringify({channel: "selectFolder:get"}));
        })
        // receiver
        let that = this
        this.props.ws.onmessage = function (evt) {
            const result = JSON.parse(evt.data)
            if (result.channel === "selectFolder:response") {
                that.setState({location: result.selectedFile});
            }
        }
    }
    //
    changeParentsActiveView = (newActiveView) => {
        this.props.changeParentsActiveView(newActiveView);
    }
    //
    submitRegistration = (password, location) => {
        this.props.ws.send(JSON.stringify({
            channel: "localLogin:registerResponse",
            password: password,
            location: location
        }));
        // receiver
        let that = this
        this.props.ws.onmessage = function (evt) {
            const result = JSON.parse(evt.data)
            if (result.channel === "selectFolder:response") {
                if (result.localRegistrationSuccess === true) {
                    that.changeParentsActiveView(ViewType.passwordListView);
                } else {
                }
            }
        }
    }
}


class DefaultLoginViewController extends Component {
    //
    dbExists = () => {
        this.props.ws.send(JSON.stringify({channel: "db:exists"}));
        // receiver
        let that = this
        this.props.ws.onmessage = function (evt) {
            const result = JSON.parse(evt.data)
            if (result.channel === "db:response") {
                if (result.dbExists === true) {
                    that.popAndChangeView(ViewType.localLoginView);
                } else {
                    that.popAndChangeView(ViewType.localRegistrationView);
                }
            }
        }
    }
    //
    submitSubmitLogin = (userServer, userEmail, userPassword, saveEmail) => {
        this.props.ws.send(JSON.stringify({
            channel: "remoteLogin:login",
            server: userServer,
            email: userEmail,
            password: userPassword,
            saveEmail: saveEmail
        }));
        // receiver
        let that = this
        this.props.ws.onmessage = function (evt) {
            const result = JSON.parse(evt.data)
            if (result.channel === "remoteLogin:response") {
                if (result.remoteLoginSuccess === true) {
                    that.popAndChangeView(ViewType.passwordListView);
                }
            }
        }
    }
    //
    popAndChangeView = (destinationView) => {
        this.props.changeParentsActiveView(destinationView);
    }
    //
    getEmail = () => {
        this.props.ws.send(JSON.stringify({
            channel: "email:get"
        }));
        // receiver
        let that = this
        this.props.ws.onmessage = function (evt) {
            const result = JSON.parse(evt.data)
            if (result.channel === "email:response") {
                if (result.email !== "") {
                    that.setState({email: result.email})
                    that.setState({saveEmail: true})
                }
            }
        }
    }
    //
    getEmail = () => {
        this.props.ws.send(JSON.stringify({
            channel: "email:get"
        }));
        // receiver
        let that = this
        this.props.ws.onmessage = function (evt) {
            const result = JSON.parse(evt.data)
            if (result.channel === "email:response") {
                if (result.email !== "") {
                    that.setState({email: result.email})
                    that.setState({saveEmail: true})
                }
            }
        }
    }
}


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

class RegistrationViewController extends Component {
    //
    handleViewChange = (view) => {
        this.props.changeParentsActiveView(view);
    }
    //
    submitSubmitRegistration = (userServer, userEmail, userPassword,
                                userConfirmPassword, userFirstName, userLastName) => {
        let that = this;
        this.props.ws.send(JSON.stringify({channel: "remoteRegistration:register", userServer: userServer, userEmail: userEmail, userPassword: userPassword,
            userConfirmPassword: userConfirmPassword, userFirstName: userFirstName, userLastName: userLastName}));
        // receiver
        this.props.ws.onmessage = function (evt) {
            const result = JSON.parse(evt.data)
            if (result.channel === "remoteRegistration:response") {
                if (result.remoteRegistrationSuccess === true) {
                    that.handleViewChange(ViewType.passwordListView);
                } else {
                    // todo ui warning
                }
            }
        }
    }
}

class PasswordFieldController extends Component {

}


export {
    LocalLoginViewController,
    LocalRegistrationViewController,
    DefaultLoginViewController,
    PasswordItemViewController,
    PasswordListViewController,
    RegistrationViewController,
    PasswordFieldController
}