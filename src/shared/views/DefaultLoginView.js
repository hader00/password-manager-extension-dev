import React from 'react';
import HiddenField from "../components/HiddenField";
import ViewType from "../other/ViewType";
import PropTypes from "prop-types";
import {DefaultLoginViewController} from "../../ViewController";
import {Box, Button, ButtonGroup, FormControl, TextField,} from "@material-ui/core";
import VisibilityIcon from '@material-ui/icons/Visibility';
import Header from "../components/Header";
import {Help} from "@material-ui/icons";

class DefaultLoginView extends DefaultLoginViewController {
    constructor(props) {
        super(props);
        this.state = {
            saveEmail: true,
            email: "",
            password: "",
            passwordType: "password",
        };
    }


    render() {
        return (
            <Box style={{paddingTop: "10px", paddingBottom: "10px"}}>
                <FormControl style={{display: "flex"}} onSubmit={this.submitLogin}>
                    <Header hStyle="back" buttonText=""
                            buttonFunc={() => {
                            }}/>
                    <TextField type="email" label="Enter Email" id="email" name="email" onChange={this.onChange}
                               value={this.state.email}/>
                    <Box style={{paddingTop: "10px", paddingBottom: "10px"}}>
                        <div style={{display: "flex", margin: 0}}>
                            <TextField style={{width: "95vw"}} type={this.state.passwordType} label="Enter Password"
                                       id="password" name="password" onChange={this.onChange}
                                       value={this.state.password}/>
                            <Button
                                variant=""
                                onClick={this.togglePasswordType}
                            ><VisibilityIcon/></Button>
                        </div>
                    </Box>
                    <HiddenField
                        text={"Custom Server"} type={"text"} placeholder={"Enter Server"} name={"user-server"}
                        helpDescription={"For enterprise login"} icon={<Help/>}/>
                    <Button variant="contained" style={{marginBottom: "20px"}} id="submit-button" type="submit"
                            color="primary" onClick={this.submitLogin}>Login</Button>
                    <ButtonGroup variant="contained" aria-label="contained primary button group"
                                 style={{padding: "10px"}}>
                        <Button color="primary" style={{width: "50vh"}}
                                onClick={() => this.popAndChangeView(ViewType.registrationView)}>Create
                            Account
                        </Button>
                        <Button color="secondary" style={{width: "50vh"}} onClick={this.handleLocalLoginViewChange}>Local
                            login</Button>
                    </ButtonGroup>
                </FormControl>
            </Box>
        );
    }

    componentDidMount() {
        this.getEmail();
    }

    onChange = (e) => {
        this.setState({[e.target.name]: e.target.value});
    }

    onChangeCheckBox = (e) => {
        const checked = e.target.checked;
        this.setState({[e.target.name]: checked})
    }


    handleLocalLoginViewChange = () => {
        this.dbExists();
    }

    submitLogin = async (e) => {
        let userEmail = document.getElementById('email');
        let userPassword = document.getElementById('password');
        let userServer = document.getElementById('hiddenField');

        if (userServer.checkValidity() && userEmail.checkValidity() && userPassword.checkValidity()) {
            e.preventDefault();
            this.submitSubmitLogin(userServer.value, userEmail.value, userPassword.value, this.state.saveEmail)
        }
    }

    togglePasswordType = () => {
        if (this.state.passwordType === "password") {
            this.setState({passwordType: "text"})
        } else {
            this.setState({passwordType: "password"})
        }
    }
}


DefaultLoginView.propTypes = {
    componentName: PropTypes.string.isRequired,
    changeParentsActiveView: PropTypes.func.isRequired,
}


export default DefaultLoginView;
