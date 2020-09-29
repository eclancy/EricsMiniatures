import * as React from 'react';
import PropTypes from 'prop-types';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Typography from '@material-ui/core/Typography';
import BigLogoColor from '../../../Images/Logos/BigLogoColor.png';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import * as Constants from "../../Shared/Constants.js";
import './Header.scss';
import {Link} from 'react-router-dom';


export default function Header(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <React.Fragment>
      <Toolbar className="navbar" disableGutters>
        <div className="HomeNav">
          <img src={BigLogoColor} alt="Eric's Miniatures Home" height={50} width={121} ></img>
        </div>

        <IconButton className={'menuIcon'} aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
          <MenuIcon />
        </IconButton>

        <Menu
          className="dropdownMenu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          getContentAnchorEl={null}
        >
          {Constants.sections.map((section) => (
            <MenuItem key={section.title} component={Link} to={section.url} onClick={handleClose}>
              <Typography>{section.title}</Typography>
            </MenuItem>
          ))}
        </Menu>

      </Toolbar>
    </React.Fragment>
  );
}

Header.propTypes = {
  sections: PropTypes.array,
  title: PropTypes.string,
};
