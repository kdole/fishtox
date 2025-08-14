import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Link,
} from '@mui/material';

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="about-dialog-title"
    >
      <DialogTitle id="about-dialog-title">
        About FishTox
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" paragraph>
          FishTox helps California anglers explore mercury levels in fish.
        </Typography>

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 500 }}>
          Data Source
        </Typography>
        <Typography variant="body2" paragraph>
          Mercury concentration data is from{' '}
          <Link
            href="https://ceden.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            CEDEN
          </Link>
          , the California Environmental Data Exchange Network. You can download raw data on mercury and other contaminants from the{' '}
          <Link
            href="https://ceden.waterboards.ca.gov/"
            target="_blank"
            rel="noopener noreferrer"
          >
            CEDEN data query tool
          </Link>
          .
        </Typography>

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 500 }}>
          Consumption Guidance
        </Typography>
        <Typography variant="body2" paragraph>
          Consumption advisories are based on an 8 ounce serving size for a 160-pound adult.
          Scale portions accordingly: 2 ounces would be one serving for a 40-pound child.
          The methodology for developing consumption guidance is detailed in this{' '}
          <Link
            href="https://oehha.ca.gov/fish/report/fish-contaminant-goals-and-advisory-tissue-levels-evaluating-methylmercury-chlordane-ddts-dieldrin"
            target="_blank"
            rel="noopener noreferrer"
          >
            OEHHA technical report
          </Link>
          .
        </Typography>

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 500 }}>
          Shellfish and Biotoxins
        </Typography>
        <Typography variant="body2" paragraph>
          For marine crustaceans and mollusks, the primary health concern is biotoxins rather than mercury.
          Biotoxin advisories can change on short notice, so call the{' '}
          <Link
            href="https://www.cdph.ca.gov/Programs/OPA/Pages/Shellfish-Advisories.aspx"
            target="_blank"
            rel="noopener noreferrer"
          >
            California Department of Public Health
          </Link>
          {' '}information line before harvesting: <strong>1-800-553-4133</strong>.
        </Typography>

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 500 }}>
          Other Contaminants
        </Typography>
        <Typography variant="body2" paragraph>
        This app focuses on mercury because it's the primary contaminant driving most
        California fish consumption advisories. Considering mercury levels alone would
        leave most current advisories unchanged. The main exceptions are urban bays and
        harbors, where PCBs and other industrial contaminants pose risks.
        For example, if you eat fish from San Francisco Bay you may want to review the{' '}
          <Link
            href="https://oehha.ca.gov/fish/advisories/san-francisco-bay"
            target="_blank"
            rel="noopener noreferrer"
          >
            SF Bay advisories
          </Link>
          , which are based on both mercury and PCB levels.
        </Typography>
        <Typography variant="body2" paragraph>
          This tool is for informational purposes only. Consult the{' '}
          <Link
            href="https://oehha.ca.gov/fish/advisories"
            target="_blank"
            rel="noopener noreferrer"
          >
            California OEHHA Fish Advisories
          </Link>{' '}
          for official guidance on fish consumption.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
