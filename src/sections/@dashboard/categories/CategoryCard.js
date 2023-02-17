import PropTypes from 'prop-types';
// @mui
import { Box, Card, Link, Typography, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
// components
import Label from '../../../components/Label';
import { MoreMenu } from '../user';

// ----------------------------------------------------------------------

const StyledProductImg = styled('img')({
  top: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute',
});

// ----------------------------------------------------------------------

CategoryCard.propTypes = {
  category: PropTypes.object,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default function CategoryCard({ category, onEdit, onDelete }) {
  return (
    <Card>
      <MoreMenu
        style={{
          position: 'absolute',
          top: 5,
          right: 0,
          zIndex: 10,
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: 20,
        }}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      <Box sx={{ pt: '100%', position: 'relative' }}>
        {!category?.isAvailable && (
          <Label
            variant="ghost"
            color={'error'}
            sx={{
              zIndex: 9,
              top: 10,
              left: 24,
              position: 'absolute',
              textTransform: 'uppercase',
            }}
          >
            Not Available
          </Label>
        )}
        <StyledProductImg alt={category?.name?.en} src={category?.imageURL} />
      </Box>

      <Stack spacing={2} sx={{ p: 3 }} direction={'row'}>
        <Typography variant="subtitle2" noWrap style={{ width: '45%' }}>
          {category?.name?.en}
        </Typography>
        <Typography variant="subtitle2" noWrap style={{ textAlign: 'right', width: '45%' }}>
          {category?.name?.ar}
        </Typography>
      </Stack>
    </Card>
  );
}
