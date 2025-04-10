import React from 'react';
import MuiAlert from '@material-ui/lab/Alert';

/**
 * AlertWrapper component
 * 
 * This is a wrapper around Material-UI's Alert component to ensure consistent imports
 * and avoid the "Alert is not exported from @material-ui/core" error.
 * 
 * Usage:
 * import { Alert } from '../components/common/AlertWrapper';
 * 
 * <Alert severity="success">This is a success message!</Alert>
 */
const Alert = (props) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
};

export { Alert };
export default Alert;
