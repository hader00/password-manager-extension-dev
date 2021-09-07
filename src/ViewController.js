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
                    console.log("Login unsuccessful");
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
                    console.log("Registration NOT successful");
                }
            }
        }
    }
    //
    changeParentsActiveView = (newActiveView) => {
        this.props.changeParentsActiveView(newActiveView);
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
    submitSubmitLogin = (userServer, userEmail, userPassword) => {
        this.props.ws.send(JSON.stringify({
            channel: "remoteLogin:login",
            server: userServer,
            email: userEmail,
            password: userPassword
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
}


class PasswordItemViewController extends Component {
    decryptPassword = async (encryptedPassword) => {
        this.props.ws.send(JSON.stringify({channel: "password:decrypt", password: encryptedPassword}));
        // receiver
        return new Promise((resolve, reject) => {
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
            const result = JSON.parse(evt.data)
            if (result.channel === "password:generateResponse") {
                if (result.password.length > 0) {
                    that.setState({Password: result.password})
                } else {
                    console.log("fail")
                    console.log(result)
                }
            }
        }
    }
    //
    addPassword = () => {
        let Title = this.state.Title;
        let Description = this.state.Description;
        let Url = this.state.Url;
        let Username = this.state.Username;
        let Password = this.state.Password;
        this.props.ws.send(JSON.stringify({
            channel: "passwords:add",
            Title: Title,
            Description: Description,
            Url: Url,
            Username: Username,
            Password: Password
        }));
        // receiver
        let that = this;
        this.props.ws.onmessage = function (evt) {
            const result = JSON.parse(evt.data)
            if (result.channel === "passwords:addResponse") {
                if (result.addSuccess === true) {
                    console.log(result)
                    that.popView();
                } else {
                    console.log("fail")
                    console.log(result)
                }
            }
        }
    }
    //
    updatePassword = () => {
        let Id = this.state.Id;
        let Title = this.state.Title;
        let Description = this.state.Description;
        let Url = this.state.Url;
        let Username = this.state.Username;
        let Password = this.state.Password;
        this.props.ws.send(JSON.stringify({
            channel: "passwords:update",
            Id: Id,
            Title: Title,
            Description: Description,
            Url: Url,
            Username: Username,
            Password: Password
        }));
        // receiver
        let that = this;
        this.props.ws.onmessage = function (evt) {
            const result = JSON.parse(evt.data)
            if (result.channel === "passwords:updateResponse") {
                if (result.updateSuccess === true) {
                    console.log(result)
                    that.popView();
                } else {
                    console.log("fail")
                    console.log(result)
                }
            }
        }
    }
    //
    deletePassword = () => {
        let Id = this.state.Id;
        this.props.ws.send(JSON.stringify({channel: "passwords:delete", Id: Id}));
        // receiver
        let that = this;
        this.props.ws.onmessage = function (evt) {
            const result = JSON.parse(evt.data)
            if (result.channel === "passwords:deleteResponse") {
                if (result.deleteSuccess === true) {
                    console.log(result)
                    that.popView();
                } else {
                    console.log("fail")
                    console.log(result)
                }
            }
        }
    }
}

class PasswordListViewController extends Component {
    fetchAllPPasswords = () => {
        let that = this;
        this.props.ws.send(JSON.stringify({channel: "passwords:fetch"}));
        console.log("Fetching all passwords");
        // receiver
        this.props.ws.onmessage = function (evt) {
            const result = JSON.parse(evt.data)
            if (result.channel === "passwords:fetchResponse") {
                that.setState({response: result.response});
                that.setState({passwords: result.response});
            }
        }
    }
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


export {
    LocalLoginViewController,
    LocalRegistrationViewController,
    DefaultLoginViewController,
    PasswordItemViewController,
    PasswordListViewController,
    RegistrationViewController
}