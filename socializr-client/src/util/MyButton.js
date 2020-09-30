import React from 'react'
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';

//efficient to prevent repetitive code blocks with this single reusable button code block
export default ({ children, onClick, tip, btnClassName, tipClassName }) => (//children- whatever is inside the button

    //className always not required 
    <Tooltip title={tip} className={tipClassName} placement="top">
        <IconButton onClick={onClick} className={btnClassName}>
            {children}
        </IconButton>
    </Tooltip>

) //parentheses suitable as no logic is being processed