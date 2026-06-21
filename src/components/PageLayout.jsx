import { Link } from 'react-router-dom'
import { Box, Button, Card, Stack, Typography } from '@mui/material'
import logo from '../assets/rajaranilogo-160.png'
import './PageLayout.css'

export default function PageLayout({ title, subtitle, backTo = '/', children, actions }) {
  return (
    <Box className="page-layout">
      <Card component="header" variant="rrHeader" className="page-header" elevation={0}>
        <Stack className="page-header-main">
          <Button
            component={Link}
            to={backTo}
            className="back-link"
            sx={{ alignSelf: 'flex-start', p: 0, minWidth: 'auto' }}
          >
            ← Back
          </Button>
          <Box className="page-brand">
            <img
              src={logo}
              alt="Raja Rani Bakery & Restaurant"
              className="page-logo"
              loading="lazy"
              decoding="async"
            />
            <Box>
              <Typography component="h1">{title}</Typography>
              {subtitle ? <Typography className="page-subtitle">{subtitle}</Typography> : null}
            </Box>
          </Box>
        </Stack>
        {actions ? (
          <Stack
            className="page-header-actions"
            direction="row"
            useFlexGap
            flexWrap="wrap"
            justifyContent="flex-end"
            alignItems="center"
          >
            {actions}
          </Stack>
        ) : null}
      </Card>
      <Box className="page-content">{children}</Box>
    </Box>
  )
}
