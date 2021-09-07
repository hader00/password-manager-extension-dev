import './shared/App.css';
import {Component} from "react";
import ViewType from "./shared/other/ViewType";
import DefaultLoginView from "./shared/views/DefaultLoginView";
import SwitchComponents from "./shared/components/SwitchComponent";
import LocalLoginView from "./shared/views/LocalLoginView";
import LocalRegistrationView from "./shared/views/LocalRegistrationView";
import RegistrationView from "./shared/views/RegistrationView";
import PasswordsListView from "./shared/views/PasswordListView";
import PasswordItemView from "./shared/views/PasswordItemView";

class App extends Component {
    timeout = 250; // Initial timeout duration as a class variable
    ws;

    constructor(props) {
        super(props);
        this.ws = this.connect();
        this.state = {
            ws: this.ws,
            activeView: null,
            passwordItem: {},
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
                                       ws={this.ws}/>
                    <PasswordItemView
                        componentName={ViewType.passwordItem}
                        changeParentsActiveView={this.changeActiveView}
                        password={this.state.passwordItem.password}
                        inputReadOnly={this.state.passwordItem.inputReadOnly}
                        addingNewItem={this.state.passwordItem.addingNewItem}
                        ws={this.ws}
                    />
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

    connect = () => {
        let ws = new WebSocket("ws://localhost:3002/");
        let that = this; // cache the this
        let connectInterval;

        // websocket onopen event listener
        ws.onopen = () => {
            console.log("connected websocket main component");
            that.timeout = 250; // reset timer to 250 on open of websocket connection
            clearTimeout(connectInterval); // clear Interval on on open of websocket connection
            this.getActiveView();
        };

        // websocket onclose event listener
        ws.onclose = e => {
            console.log(
                `Socket is closed. Reconnect will be attempted in ${Math.min(
                    10000 / 1000,
                    (that.timeout + that.timeout) / 1000
                )} second.`,
                e.reason
            );

            that.timeout = that.timeout + that.timeout; //increment retry interval
            connectInterval = setTimeout(this.check, Math.min(10000, that.timeout)); //call check function after timeout
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
            this.setState({activeView: response.defaultView});
        }
    }
    getActiveView = () => {
        this.state.ws.send(JSON.stringify({channel:"defaultView:get"}));
    }
}

export default App;
