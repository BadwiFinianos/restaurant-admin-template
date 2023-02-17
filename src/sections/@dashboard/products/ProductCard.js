import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// material
import { Card, Link, Typography, Stack, CircularProgress } from '@mui/material';

// components
import Label from '../../../components/Label';
// ----------------------------------------------------------------------

const PRIORITIES = ['None', 'Low', 'Medium', 'High', 'Urgent'];
export default function ShopProductCard({ project }) {
  const { name, description, estimatedCost, currency, available, endDate, priority } = project;
  const [percentage] = useState(((available * 100) / estimatedCost).toFixed(1));
  return (
    <Card>
      <Label
        variant="filled"
        color={'error'}
        sx={{
          zIndex: 9,
          top: 16,
          right: 16,
          position: 'absolute',
          textTransform: 'uppercase',
        }}
      >
        {PRIORITIES[priority]}
      </Label>
      <Stack spacing={2} sx={{ p: 3 }}>
        <Link to="#" color="inherit" underline="hover" component={RouterLink}>
          <Typography variant="h4" noWrap>
            {name}
          </Typography>
        </Link>
        <Typography variant="subtitle2" noWrap>
          {description}
        </Typography>
        <Typography variant="subtitle2" noWrap>
          {endDate.toDateString()}
        </Typography>

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1">{`${currency}${available} / ${currency}${estimatedCost}`}</Typography>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: 140,
              height: 140,
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <Typography variant="h5" noWrap>
              {`${percentage}%`}
            </Typography>
            <CircularProgress
              variant="determinate"
              value={percentage}
              size={140}
              thickness={6}
              style={{ position: 'absolute', top: 0, left: 0 }}
            />
          </div>
        </Stack>
      </Stack>
    </Card>
  );
}
