import * as React from 'react';
import PropTypes from 'prop-types';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Typography from '@material-ui/core/Typography';
import BigLogoColor from '../../../Images/Logos/BigLogoColor.png';
import BigLogoColorWhiteEye from '../../../Images/Logos/BigLogoColorWhiteEye.png';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import * as Constants from "../Constants.js";
import './Header.scss';
import { Link, useLocation } from 'react-router-dom';

export default function Header(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const location = useLocation();

  return (

    <React.Fragment>
      <Toolbar className={location.pathname.includes('exhibit') ? "navbar darkMode" : "navbar"} disableGutters>
        <Link className="HomeNav" to={"/"}>
          <img src={location.pathname.includes('exhibit') ? BigLogoColorWhiteEye : BigLogoColor} alt="Eric's Miniatures Home" width={160}></img>
        </Link>

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
          <MenuItem component={Link} to={"/"} onClick={handleClose} >
            <Typography>{"Home"}</Typography>
          </MenuItem>
          {Constants.sections.map((section, index) => (
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
