import React from 'react'
import {Button, TextField} from "@material-ui/core";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import SettingsIcon from '@material-ui/icons/Settings';
import {PasswordFieldController} from "../../ViewController";


export default class PasswordField extends PasswordFieldController {
    constructor(props) {
        super(props);
        this.state = {
            type: this.props.type,
            timeout: null,
            text: null
        }
    }

    render() {
        return (
            <div style={{marginTop: "10px", display: "flex"}}>
                <TextField
                    inputProps={{
                        readOnly: Boolean(this.props.inputReadOnly),
                        disabled: Boolean(this.props.inputReadOnly),
                    }}
                    value={this.props.value || ''}
                    style={{display: "flex", width: "70vw"}}
                    type={this.state.type}
                    label={this.props.placeholder}
                    name={this.props.name} id={this.props.id} onChange={this.props.onChange}/>
                {(this.state.type === "password") ?
                    <>
                        {this.props.value?.length > 0 ?
                            <Button
                                style={{paddingBottom: "15px", paddingTop: "15px"}}
                                variant=""
                                onClick={async () => {
                                    this.setState({type: "text"});
                                }}>
                                <VisibilityIcon/></Button>
                            :
                            <></>
                        }
                        {this.props.value?.length > 0 ?
                            <Button
                                style={{paddingBottom: "15px", paddingTop: "15px"}}
                                variant=""
                                onClick={async (e) => {
                                    e.preventDefault();
                                    await this.copy(this.props.value);
                                }}>
                                <FileCopyIcon/></Button>
                            :
                            <></>
                        }
                        {(this.props.inputReadOnly === true) ?
                            <></>
                            :
                            <Button
                                style={{paddingBottom: "15px", paddingTop: "15px", boxShadow: "none"}}
                                variant={this.props.showingGenerator === true ? "contained" : ""}
                                onClick={async (e) => {
                                    e.preventDefault();
                                    this.props.togglePasswordGenerator();
                                }}>
                                <SettingsIcon/></Button>
                        }
                    </>
                    :
                    <>
                        <Button
                            style={{paddingBottom: "15px", paddingTop: "15px"}}
                            variant=""
                            onClick={() => {
                                this.setState({type: "password"});
                            }}>
                            <VisibilityOffIcon/></Button>
                        <Button
                            style={{paddingBottom: "15px", paddingTop: "15px"}}
                            variant=""
                            onClick={async (e) => {
                                e.preventDefault();
                                await this.copy(this.props.value);
                            }}>
                            <FileCopyIcon/></Button>
                        {(this.props.inputReadOnly === true) ?
                            <></>
                            :
                            <Button
                                style={{paddingBottom: "15px", paddingTop: "15px"}}
                                variant=""
                                onClick={async (e) => {
                                    e.preventDefault();
                                    this.props.togglePasswordGenerator();
                                }}>
                                <SettingsIcon/></Button>
                        }
                    </>
                }
            </div>
        )
    }

    clearClipboardOnFocus = () => {
        window.addEventListener('focus', async function () {
            await navigator.clipboard.writeText("");
        },{once : true})
    }
}