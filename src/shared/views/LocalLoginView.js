import React from 'react';
import HiddenField from "../components/HiddenField";
import Header from "../components/Header";
import ViewType from "../other/ViewType"
import PropTypes from "prop-types";
import {LocalLoginViewController} from "../../ViewController";
import {Button, FormControl, TextField} from "@material-ui/core";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";


class LocalLoginView extends LocalLoginViewController {
    constructor(props) {
        super(props);
        this.state = {
            location: "",
            password: ""
        }
    }

    render() {
        return (
            <FormControl style={{display: "flex"}} onSubmit={this.submitLocalLogin}>
                <Header hStyle="back" buttonText="Back" icon={<ArrowBackIosIcon/>}
                        buttonFunc={() => this.handleViewChange(ViewType.defaultLoginView)}/>
                <TextField type="password" label="Enter Password" id="password" name="password" onChange={this.onChange}
                           value={this.state.password}/>
                <HiddenField
                    text={"Custom Location"} type={"file"} placeholder={"Custom Location"}
                    name={"user-file-location"} id={"user-file-location"}
                    helpDescription={"Enter custom location of passwords database"}
                    location={this.state.location}/>

                <Button color="primary" variant="contained" onClick={this.submitLocalLogin}>Login</Button>
            </FormControl>
        );
    }

    submitLocalLogin = (e) => {
        let userPassword = document.getElementById('password');
        let userLocation = document.getElementById('hiddenField');
        if (userPassword.checkValidity() && userLocation.checkValidity()) {
            e.preventDefault();
            this.submitLogin(userPassword.value, userLocation.value)
        }
    }

    componentDidMount() {
        this.selectFile();
    }
}

LocalLoginView.propTypes = {
    componentName: PropTypes.string.isRequired,
    changeParentsActiveView: PropTypes.func.isRequired,
}

export default LocalLoginView;
