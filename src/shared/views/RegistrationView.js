import React from 'react';
import HiddenField from "../components/HiddenField";
import ViewType from "../other/ViewType";
import Header from "../components/Header";
import PropTypes from "prop-types";
import {RegistrationViewController} from "../../ViewController";
import {Button, FormControl, TextField} from "@material-ui/core";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";

class RegistrationView extends RegistrationViewController {
    render() {
        return (
            <FormControl style={{display: "flex"}} onSubmit={this.submitRegistration}>
                <Header hStyle="back" buttonText="Back"
                        icon={<ArrowBackIosIcon/>}
                        buttonFunc={() => this.handleViewChange(ViewType.defaultLoginView)}/>
                <TextField text={"First Name"} type={"text"} placeholder={"Enter First Name"}
                           name={"user-first-name"} id={"user-first-name"}/>
                <TextField text={"Last Name"} type={"text"} placeholder={"Enter Last Name"} name={"user-last-name"}
                           id={"user-last-name"}/>
                <TextField text={"Email"} type={"email"} placeholder={"Enter Email"} name={"user-email"}
                           id={"user-email"}/>
                <TextField text={"Password"} type={"password"} placeholder={"Enter Password"} name={"user-password"}
                           id={"user-password"}/>
                <TextField text={"Confirm Password"} type={"password"} placeholder={"Confirm Password"}
                           name={"user-confirm-password"} id={"user-confirm-password"}/>
                <HiddenField
                    text={"Custom Server"} type={"text"} placeholder={"Enter Server"} name={"user-server"}
                    id={"user-server"}
                    helpDescription={"For enterprise login"}/>
                <Button color="primary" variant="contained" type="submit" onClick={this.submitRegistration}>Register</Button>
            </FormControl>
        );
    }


    submitRegistration = (e) => {
        let userFirstName = document.getElementById('user-first-name');
        let userLastName = document.getElementById('user-last-name');
        let userEmail = document.getElementById('user-email');
        let userPassword = document.getElementById('user-password');
        let userConfirmPassword = document.getElementById('user-confirm-password');
        let userServer = document.getElementById('hiddenField');
        //
        if (userFirstName.checkValidity() && userLastName.checkValidity() && userServer.checkValidity() &&
            userEmail.checkValidity() && userPassword.checkValidity() && userConfirmPassword.checkValidity()) {
            //
            e.preventDefault();
            //
            this.submitSubmitRegistration(userServer.value, userEmail.value, userPassword.value, userConfirmPassword.value, userFirstName.value, userLastName.value)
        }
    }


    componentDidMount() {
    }
}

RegistrationView.propTypes = {
    componentName: PropTypes.string.isRequired,
    changeParentsActiveView: PropTypes.func.isRequired,
}

export default RegistrationView;
