import './shared/App.css';
import ViewType from "./shared/other/ViewType";
import DefaultLoginView from "./shared/views/DefaultLoginView";
import SwitchComponents from "./shared/components/SwitchComponent";
import LocalLoginView from "./shared/views/LocalLoginView";
import LocalRegistrationView from "./shared/views/LocalRegistrationView";
import RegistrationView from "./shared/views/RegistrationView";
import PasswordsListView from "./shared/views/PasswordListView";
import PasswordItemView from "./shared/views/PasswordItemView";
import {fillCredentials} from "./contentScript";
import {Button} from "@material-ui/core";
import {PasswordItemViewController} from "./ViewController";

class App extends PasswordItemViewController {
    timeout = 250; // Initial timeout duration as a class variable
    ws;

    constructor(props) {
        super(props);
        this.ws = this.connect();
        this.state = {
            password: "",
            ws: this.ws,
            activeView: null,
            passwords: [],
            filteredPasswords: [],
            passwordItem: {},
            decryptedPassword: "",
            defaultView: null,
            timeout: null,
        };
    }

    render() {
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
                    <PasswordsListView componentName={ViewType.passwordListView}
                                       changeParentsActiveView={this.changeActiveView}
                                       setPasswordItem={this.setPasswordItem}
                                       passwords={this.state.passwords}
                                       filteredPasswords={this.state.filteredPasswords}
                                       setFilteredPasswords={this.setFilteredPasswords}
                                       fetchAllPasswords={this.fetchAllPasswords}
                                       timeout={this.state.timeout}
                                       ws={this.ws}/>
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
                            <Button fullWidth style={{backgroundColor: "green"}} color="primary"
                                    variant="contained" onClick={async (e) => {
                                e.preventDefault();
                                fillCredentials(this.state.passwordItem.password.password.url, this.state.passwordItem.password.username, this.state.decryptedPassword)
                            }}>Fill Credentials</Button>
                            :
                            <></>
                        }
                    </div>
                </SwitchComponents>
            </div>
        );
    }

    componentDidMount() {
        // todo add local storage to switch default views
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

    connect = () => {
        let ws = new WebSocket("ws://localhost:3002/");
        let that = this;
        let connectInterval;

        ws.onopen = () => {
            console.log("connected websocket main component");
            that.timeout = 250;
            clearTimeout(connectInterval);
            this.getActiveView();
        };

        ws.onclose = () => {
            console.log(
                'Socket is closed.'
            );
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
        this.ws.send(JSON.stringify({channel: "passwords:fetch"}));
        console.log("Fetching all passwords");
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
