import { createTheme } from '@mui/material/styles'

const muiTheme = createTheme({
  palette: {
    primary: {
      main: '#b8922a',
      light: '#e8c547',
      dark: '#9a7b1f',
      contrastText: '#1a1a1a',
    },
    background: {
      default: '#fff8dc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#5c4d28',
    },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          borderRadius: 10,
        },
      },
      variants: [
        {
          props: { variant: 'rrGold' },
          style: {
            border: '2px solid var(--rr-black)',
            color: 'var(--rr-black)',
            background: 'linear-gradient(180deg, var(--rr-gold) 0%, var(--rr-gold-dark) 100%)',
            boxShadow: '0 4px 12px rgba(26, 26, 26, 0.25)',
            '&:hover': {
              filter: 'brightness(1.08)',
              background: 'linear-gradient(180deg, var(--rr-gold) 0%, var(--rr-gold-dark) 100%)',
            },
          },
        },
        {
          props: { variant: 'rrDangerGhost' },
          style: {
            border: '2px solid #fecaca',
            color: '#fecaca',
            background: 'transparent',
            boxShadow: '0 4px 12px rgba(26, 26, 26, 0.25)',
            '&:hover': {
              border: '2px solid #fecaca',
              background: 'rgba(185, 28, 28, 0.25)',
            },
          },
        },
      ],
    },
    MuiCard: {
      variants: [
        {
          props: { variant: 'rrSurface' },
          style: {
            background: 'linear-gradient(180deg, var(--rr-card) 0%, var(--rr-cream) 100%)',
            border: '2px solid var(--rr-gold-dark)',
            borderRadius: 14,
            boxShadow: '0 8px 24px var(--rr-shadow)',
          },
        },
        {
          props: { variant: 'rrHeader' },
          style: {
            background: 'linear-gradient(135deg, var(--rr-black) 0%, var(--rr-black-soft) 100%)',
            border: '2px solid var(--rr-gold)',
            borderRadius: 16,
            boxShadow: '0 8px 28px var(--rr-shadow)',
          },
        },
      ],
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#fff',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#d1d5db',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#d1d5db',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#b8922a',
            borderWidth: 1,
          },
        },
      },
    },
  },
})

export default muiTheme
