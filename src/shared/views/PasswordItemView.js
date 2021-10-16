import React from 'react'
import PropTypes from 'prop-types';
import Header from "../components/Header";
import {PasswordItemViewController} from "../../ViewController";
import PasswordField from "../components/PasswordField";
import PasswordGenerator from "../components/PasswordGenerator";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import {Button, FormControl, TextField} from "@material-ui/core";

export class PasswordItemView extends PasswordItemViewController {

    static defaultProps = {
        password: {},
        inputReadOnly: false
    }

    constructor(props) {
        super(props);
        this.state = {
            ...this.props.password,
            generator: {
                length: 10,
                specialCharacters: true,
                numbers: true,
                lowerCase: true,
                upperCase: true,
            }
        }
        console.log(this.props.password)
    }


    render() {
        return (
            <FormControl style={{display: "flex"}}>
                <Header icon={<ArrowBackIosIcon/>} buttonText="Back" text={this.state.title} buttonFunc={this.popView}/>
                <TextField style={{marginTop: "10px"}} text={"Title"} value={this.state.title} type={"text"}
                           label={"Enter Title"}
                           name={"title"} id={"title"} inputReadOnly={this.props.inputReadOnly} inputRequired={true}
                           onChange={e => this.onChange(e)}/>
                <TextField style={{marginTop: "10px"}} text={"Username"} value={this.state.username} type={"text"}
                           label={"Enter Username"}
                           name={"username"} id={"username"} inputReadOnly={this.props.inputReadOnly}
                           inputRequired={true} onChange={e => this.onChange(e)}/>
                <PasswordField text={"Password"} value={this.state.password} type={"password"}
                               placeholder={"Enter Password"} name={"password"} id={"password"}
                               inputReadOnly={this.props.inputReadOnly} inputRequired={true}
                               onChange={e => this.onChange(e)} showViewPassOptions={!this.props.addingNewItem}/>
                <TextField style={{marginTop: "10px"}} text={"Description"} value={this.state.description} type={"text"}
                           label={"Enter Description"} name={"description"} id={"description"}
                           inputReadOnly={this.props.inputReadOnly} inputRequired={false}
                           onChange={e => this.onChange(e)}/>
                <TextField style={{marginTop: "10px"}} text={"Url"} value={this.state.url} type={"text"}
                           label={"Enter URL"} name={"url"}
                           id={"url"} inputReadOnly={this.props.inputReadOnly} inputRequired={true}
                           onChange={e => this.onChange(e)}/>
                {
                    (!this.props.inputReadOnly && !this.props.addingNewItem) ?
                        <>
                            <Button color="primary" id="submit-button" type="button"
                                    onClick={this.updatePassword}>{"Update"}</Button>
                            <Button color="primary" className="cancel-btn" type="button"
                                    onClick={this.deletePassword}>{"Delete"}</Button>
                        </> :
                        (!this.props.addingNewItem) ?
                            <Button color="primary" onClick={this.openBrowser}>{"Visit page"}</Button> :
                            <Button color="primary" id="submit-button" type="submit"
                                    onClick={this.addPassword}>{"Save"}</Button>
                }
                {
                    (this.props.addingNewItem) ?
                        <div style={{display: "block", textAlign: "center"}}>
                            <PasswordGenerator generator={this.state.generator} onChange={this.onChange}
                                               setGeneratorState={this.onChangeGenerator}/>
                            <Button color="primary" className="submit-button" type="button"
                                    style={{display: "inline-block", margin: "0 auto"}}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        let gen = this.state.generator;
                                        this.generatePassword(gen.length, gen.specialCharacters, gen.numbers, gen.lowerCase, gen.upperCase)
                                    }}>{"Generate Password"}</Button>
                        </div>
                        :
                        <></>
                }
            </FormControl>
        )
    };

    onChange = (e) => {
        this.setState({[e.target.name]: e.target.value});
    }

    onChangeGenerator = (name, value) => {
        const newGenerator = {...this.state.generator, [name]: value}
        this.setState({generator: newGenerator});
    }

    openBrowser = () => {
        window.electron.shellOpenExternal("https://" + this.state.url);
    }

    componentDidMount() {
        if (!this.props.addingNewItem) {
            this.decryptPassword(this.state.password).then(password => {
                this.setState({password: password})
                this.props.onChangePassword(password);
            });
        }
    }
}

PasswordItemView.propTypes = {
    password: PropTypes.object.isRequired,
    inputReadOnly: PropTypes.bool.isRequired,
}


export default PasswordItemView;

