import React, {Component} from "react";
import PropTypes from "prop-types";
import {Box, Button, Input, Typography} from "@material-ui/core";
import HighlightOffIcon from '@material-ui/icons/HighlightOff';

export class Header extends Component {
    render() {
        return (
            <Box style={{display: "flex", verticalAlign: "text-bottom"}}>
                {this.props.icon !== undefined ?
                    <Button
                        style={{marginRight: "10px"}}
                        startIcon={this.props.icon}
                        color="primary" variant="contained"
                        onClick={this.props.buttonFunc}>{this.props.buttonText}</Button>
                    :
                    <></>
                }
                {this.props.hStyle === "input" ?
                    <div style={{display: "flex", margin: 0}}>
                        <Input value={this.props.searchValue} variant="outlined" type="text" id="search"
                               placeholder="Search" onChange={this.props.onChange}/>
                        {this.props.searchValue !== "" ?
                            <Button
                                variant=""
                                onClick={this.props.clearInput}
                            ><HighlightOffIcon/></Button> :
                            <></>
                        }
                    </div>
                    :
                    <div>
                        <Typography variant="h5">{this.props.text}</Typography>
                    </div>
                }
            </Box>
        )
    }
}

Header.propTypes = {
    buttonFunc: PropTypes.func.isRequired,
    buttonText: PropTypes.string.isRequired,
    hStyle: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    text: PropTypes.string
}

export default Header;
