import './shared/App.css';
import ViewType from "./shared/other/ViewType";
import SwitchComponents from "./shared/components/SwitchComponent";
import PasswordsListView from "./shared/views/PasswordListView";
import PasswordItemView from "./shared/views/PasswordItemView";
import {fillCredentials, getActiveTabURL} from "./contentScript";
import {AppBar, Box, Button, Container, Toolbar, Typography} from "@material-ui/core";
import {CustomComponent} from "./ViewController";
import PasswordItem from "./shared/components/PasswordItem";
import React from "react";
import URL_REGEX from "./shared/other/Utils";

class App extends CustomComponent {
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
        if (this.state.activeView !== ViewType.passwordListView && this.state.activeView !== ViewType.passwordItem) {
            return (
                <div className="App">
                    <Box style={{paddingTop: "10px", paddingBottom: "10px"}}>
                        <AppBar variant="fullWidth">
                            <Toolbar style={{display: "flex", justifyContent: "center"}}>
                                <Typography style={{fontWeight: "bold"}} variant="h5">Password Manager</Typography>
                            </Toolbar>
                        </AppBar>
                        <p style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                            minHeight: "100vh"
                        }}>Please open client's application and login.</p>
                    </Box>
                </div>
            )
        } else {
            return (
                <Container maxWidth="sm">
                    <Box>
                        <SwitchComponents active={this.state.activeView}>
                            <div componentName={ViewType.passwordListView}>
                                {(this.state.passwords.some(password => {
                                        return this.filterPasswords(password);
                                    }) ?
                                        <div style={{paddingTop: "60px", marginBottom: "-40px"}}>
                                            <b style={{paddingRight: "-10px"}}>Current website:</b>
                                            {(this.state.passwords.filter(password => {
                                                    return this.filterPasswords(password);
                                                }).map(password => {
                                                    return (
                                                        <PasswordItem
                                                            key={password.id}
                                                            password={password}
                                                            decryptedPassword={this.state.decryptedPassword}
                                                            parentPasswordView={this.handlePasswordView}
                                                            revertWSonMessage={this.revertWSonMessage}
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
                                    revertWSonMessage={this.revertWSonMessage}
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
                                            await fillCredentials(this.state.passwordItem.password.password.url, this.state.passwordItem.password.username, this.state.decryptedPassword)
                                        }}>Fill Credentials</Button></>
                                    :
                                    <></>
                                }
                            </div>
                        </SwitchComponents>
                    </Box>
                </Container>
            );
        }
    }

    filterPasswords(password) {
        const passwordURL = password.url?.match(URL_REGEX)
        const currentURL = this.state.curUrl?.match(URL_REGEX)
        if (passwordURL !== null && currentURL !== null) {
            if (passwordURL?.length > 1 && currentURL?.length > 1) {
                return passwordURL[1].toUpperCase() === currentURL[1].toUpperCase()
            }
        }
        return false
    }

    componentDidMount() {
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

    setPasswordForFill = async (password) => {
        console.log("setting password", password)
        await this.setState({decryptedPassword: password}, () => {
            console.log(this.state.decryptedPassword)
        })
    }

    setCurrentPasswordForFill = (password) => {
        console.log("setCurrentPasswordForFill", password)
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
            that.setStateFromResponse(evt);
        }

        // websocket onerror event listener
        ws.onerror = err => {
            console.error(
                "Socket encountered error: ",
                err.message,
                "Closing socket"
            );
            this.setState({activeView: ViewType.defaultLoginView});

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


    getActiveView = () => {
        this.ws.send(JSON.stringify({channel: "defaultView:get"}));
    }

    fetchAllPasswords = () => {
        this.ws.send(JSON.stringify({channel: "passwords:fetch"}));
    }

    getExtensionLoginState = () => {
        this.ws.send(JSON.stringify({channel: "login:get"}));
    }

    setFilteredPasswords = (value) => {
        this.setState({filteredPasswords: value});
    }

    revertWSonMessage = () => {
        let that = this
        this.ws.onmessage = function (evt) {
            that.setStateFromResponse(evt);
        }
    }

    //
    popView = () => {
        this.setState({activeView: ViewType.passwordListView});
    }
}

export default App;
