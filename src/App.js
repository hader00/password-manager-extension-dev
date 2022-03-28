import './shared/App.css';
import ViewType from "./shared/other/ViewType";
import DefaultLoginView from "./shared/views/DefaultLoginView";
import SwitchComponents from "./shared/components/SwitchComponent";
import LocalLoginView from "./shared/views/LocalLoginView";
import LocalRegistrationView from "./shared/views/LocalRegistrationView";
import RegistrationView from "./shared/views/RegistrationView";
import PasswordsListView from "./shared/views/PasswordListView";
import PasswordItemView from "./shared/views/PasswordItemView";
import {fillCredentials, getActiveTabURL, getCurrentURL} from "./contentScript";
import {Button} from "@material-ui/core";
import {PasswordItemViewController} from "./ViewController";
import PasswordItem from "./shared/components/PasswordItem";
import React from "react";

class App extends PasswordItemViewController {
    timeout = 250; // Initial timeout duration as a class variable
    ws = null;

    constructor(props) {
        super(props);
        try {
            this.ws = this.connect();
        } catch (e) {
            this.ws = null
        }
        this.state = {
            password: "",
            ws: this.ws,
            curUrl: "",
            activeView: null,
            passwords: [],
            filteredPasswords: [],
            passwordItem: {},
            decryptedPassword: "",
            currentDecryptedPassword: "",
            currentPassword: "",
            defaultView: null,
            timeout: null,
        };
    }

    render() {
        if (this.state.activeView === null) {
            return (
                <div className="App">
                    <p>Please open client's application first.</p>
                </div>
            )
        } else {
            return (
                <div className="App">
                    <SwitchComponents active={this.state.activeView}>
                        <DefaultLoginView componentName={ViewType.defaultLoginView}
                                          changeParentsActiveView={this.changeActiveView}
                                          ws={this.ws}/>
                        <LocalLoginView componentName={ViewType.localLoginView}
                                        changeParentsActiveView={this.changeActiveView}
                                        ws={this.ws}/>
                        <LocalRegistrationView componentName={ViewType.localRegistrationView}
                                               changeParentsActiveView={this.changeActiveView}
                                               ws={this.ws}/>
                        <RegistrationView componentName={ViewType.registrationView}
                                          changeParentsActiveView={this.changeActiveView}
                                          ws={this.ws}/>
                        <div componentName={ViewType.passwordListView}>
                            {(this.state.passwords.some(password => {
                                const passwordURL = password.url.match('^.*[\\.|/]([a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\\.[a-zA-Z]{2,})')
                                const currentURL = this.state.curUrl.match('^.*[\\.|/]([a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\\.[a-zA-Z]{2,})')
                                if (passwordURL !== null && currentURL !== null) {
                                    if (passwordURL.length > 1 && currentURL.length > 1) {
                                        return passwordURL[1] === currentURL[1]
                                    } else {
                                        return false
                                    }
                                } else {
                                    return false
                                }
                            }) ?
                                <div style={{paddingTop: "40px", marginBottom: "-40px"}}>
                                    <b style={{paddingRight: "-10px"}}>Current website:</b>
                                    {(this.state.passwords.filter(password => {
                                        const passwordURL = password.url.match('^.*[\\.|/]([a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\\.[a-zA-Z]{2,})')
                                        const currentURL = this.state.curUrl.match('^.*[\\.|/]([a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\\.[a-zA-Z]{2,})')
                                        if (passwordURL !== null && currentURL !== null) {
                                            if (passwordURL.length > 1 && currentURL.length > 1) {
                                                return passwordURL[1] === currentURL[1]
                                            } else {
                                                return false
                                            }
                                        } else {
                                            return false
                                        }
                                    }).map(password => {
                                        return (
                                            <PasswordItem
                                                key={password.id}
                                                password={password}
                                                parentPasswordView={this.handlePasswordView}
                                                setCurrentPasswordForFill={this.setCurrentPasswordForFill}
                                                ws={this.ws}
                                            />)
                                    })
                                    )}
                                    <b style={{paddingRight: "-10px"}}>All items:</b>
                                </div>
                                :
                                <>
                                </>
                            )}
                            <PasswordsListView
                                               changeParentsActiveView={this.changeActiveView}
                                               setPasswordItem={this.setPasswordItem}
                                               passwords={this.state.passwords}
                                               filteredPasswords={this.state.filteredPasswords}
                                               setFilteredPasswords={this.setFilteredPasswords}
                                               fetchAllPasswords={this.fetchAllPasswords}
                                               timeout={this.state.timeout}
                                               ws={this.ws}/>

                        </div>
                        <div
                            componentName={ViewType.passwordItem}>
                            <PasswordItemView
                            changeParentsActiveView={this.changeActiveView}
                            setPasswordForFill={this.setPasswordForFill}
                            password={this.state.passwordItem.password}
                            inputReadOnly={this.state.passwordItem.inputReadOnly}
                            addingNewItem={this.state.passwordItem.addingNewItem}
                                ws={this.ws}
                            />
                            {!this.state.passwordItem.addingNewItem ?
                                <>
                                <div></div>
                                <Button fullWidth style={{backgroundColor: "green"}} color="primary"
                                        variant="contained" onClick={async (e) => {
                                    e.preventDefault();
                                    fillCredentials(this.state.passwordItem.password.password.url, this.state.passwordItem.password.username, this.state.decryptedPassword)
                                }}>Fill Credentials</Button></>
                                :
                                <></>
                            }
                        </div>
                    </SwitchComponents>
                </div>
            );
        }
    }

    componentDidMount() {
        // todo add local storage to switch default views
        let that = this
        getActiveTabURL().then(r => {
            that.setState({curUrl: r});
        })
    }

    changeActiveView = (newActiveView) => {
        this.setState({activeView: newActiveView});
    }

    setPasswordItem = (newPasswordItem) => {
        this.setState({passwordItem: newPasswordItem});
    }

    setPasswordForFill = (password) => {
        this.setState({decryptedPassword: password})
    }

    setCurrentPasswordForFill = (password) => {
        this.setState({currentDecryptedPassword: password})
    }

    connect = () => {
        let ws = new WebSocket("ws://localhost:3002/");
        let that = this;
        let connectInterval;

        ws.onopen = () => {
            that.timeout = 250;
            clearTimeout(connectInterval);
            this.getActiveView();
        };

        ws.onclose = () => {
            // retry
            that.timeout = that.timeout + that.timeout;
            connectInterval = setTimeout(this.check, Math.min(10000, that.timeout));
        };


        ws.onmessage = function (evt) {
            const response = JSON.parse(evt.data)
            that.setStateFromResponse(response);
        }

        // websocket onerror event listener
        ws.onerror = err => {
            console.error(
                "Socket encountered error: ",
                err.message,
                "Closing socket"
            );

            ws.close();
        };
        return ws
    };

    /**
     * utilited by the @function connect to check if the connection is close, if so attempts to reconnect
     */
    check = () => {
        const {ws} = this.state;
        if (!ws || ws.readyState === WebSocket.CLOSED) this.connect(); //check if websocket instance is closed, if so call `connect` function.
    };

    setStateFromResponse = (response) => {
        if (response.channel === "defaultView:response") {
            this.setState({activeView: response.defaultView, timeout: response.timeout});
        }
    }
    getActiveView = () => {
        this.state.ws.send(JSON.stringify({channel:"defaultView:get"}));
    }

    onChangePassword = (newValue) => {
        this.setState({password: newValue})
    }

    fetchAllPasswords = () => {
        let that = this;
        this.ws.send(JSON.stringify({channel: "extension:login"}));
        this.ws.send(JSON.stringify({channel: "passwords:fetch"}));
        // receiver
        this.ws.onmessage = function (evt) {
            const result = JSON.parse(evt.data)
            if (result.channel === "passwords:fetchResponse") {
                that.setState({passwords: result.response});
            }
        }
    }

    getExtensionLoginState = () => {
        let that = this;
        this.ws.send(JSON.stringify({channel: "login:get"}));
        // receiver
        this.ws.onmessage = function (evt) {
            const result = JSON.parse(evt.data)
            if (result.channel === "login:response") {
                if (result.response === true) {
                    that.setState({activeView: ViewType.passwordListView});
                }
            }
        }
    }

    setFilteredPasswords = (value) => {
        this.setState({filteredPasswords: value});
    }
}

export default App;
