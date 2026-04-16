# Poker Night

React-app for å styre et hjemmepokerspill med cash game-oppsett, buy-ins, blindstruktur, chipfordeling og sluttoppgjør.

## Funksjoner

- Legg til og fjern spillere
- Registrer flere buy-ins per spiller
- Standard buy-in, starttid, sluttid og buy-in cutoff
- Automatisk blindstruktur basert på total spilletid
- Live timer for spillet og neste blindøkning
- Automatisk chipfordeling på valørene `5, 10, 25, 50, 100, 500`
- Sluttoppgjør basert på innskrevet sluttstack
- Data lagres i `localStorage`, så refresh sletter ikke spillet
- `Nullstill alt`-knapp for å starte på nytt

## Tech Stack

- React
- Vite
- Tailwind CSS

## Komme i gang

Installer avhengigheter:

```bash
npm install
```

Start utviklingsserver:

```bash
npm run dev
```

Lag produksjonsbuild:

```bash
npm run build
```

Forhåndsvis build lokalt:

```bash
npm run preview
```

## Hvordan appen fungerer

### Valuta

Appen bruker `NOK` og formatterer tall med norsk locale.

### Chipmodell

Appen bruker ikke 1:1 mellom kroner og chips. I stedet oversettes buy-ins til interne `units`.

- Standardstacken er satt til `3000 units`
- Startblindene er `15/30`
- En standardstack tilsvarer derfor `100 BB`

Chipalgoritmen prøver å:

- gi nok småchips til at spillet er praktisk
- bruke `100` som hovedvalør
- bruke `500` mer kontrollert for å unngå for mange chips totalt
- holde en tydelig sammenheng mellom stack og antall big blinds

### Blindstruktur

Blindnivåene beregnes automatisk ut fra valgt start- og sluttid.

- korte spill hopper raskere opp i ladderen
- lengre spill bruker flere mellomnivåer
- hele schedule fyller alltid den totale spilltiden

### Sluttoppgjør

Utbetaling beregnes ut fra totalt antall `units` som faktisk ble utstedt gjennom buy-ins, ikke bare det som er tastet inn så langt i sluttelling.

Formelen er:

```text
verdi per unit = totalt innbetalt / totalt utstedte units
utbetaling = spillerens slutt-units * verdi per unit
```

Hvis ikke alle sluttstacks er tastet inn ennå, vises resten som `Ikke fordelt`.

## Persistens

Spillstate lagres automatisk i nettleserens `localStorage`.

Det betyr at følgende overlever refresh:

- spillere
- buy-ins
- tidsinnstillinger
- sluttelling av chips
- buy-in-utkast

## Prosjektstruktur

```text
src/
  components/
    BlindSchedulePanel.jsx
    ChipDistributionPanel.jsx
    PlayersPanel.jsx
    SectionCard.jsx
    SettingsPanel.jsx
    SettlementPanel.jsx
    TimerPanel.jsx
  lib/
    constants.js
    gameLogic.js
  App.jsx
```

## Viktige filer

- [src/App.jsx](/Users/magnusfjeldstad/Dev/Poker/src/App.jsx): state, persistens og hovedlayout
- [src/lib/gameLogic.js](/Users/magnusfjeldstad/Dev/Poker/src/lib/gameLogic.js): chiplogikk, blinds, payouts og formattering
- [src/lib/constants.js](/Users/magnusfjeldstad/Dev/Poker/src/lib/constants.js): stack- og blindkonstanter

## Videre forbedringer

- eksport/import av spill
- bekreftelsesdialog på `Nullstill alt`
- mer avansert tuning av chipfordeling
- støtte for flere valutaer eller egne blind-ladders
