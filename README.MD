# Configuration Home Assistant

[Home Assistant OS](https://www.home-assistant.io/installation/#compare-installation-methods) est installé dans une VM sur un serveur HP ProLiant MicroServer Gen8 qui tourne sous [Unraid](https://unraid.net/fr)

Cette configuration est issue du travail de [Mattias Persson](https://github.com/matt8707/hass-config)

![dashboard](https://raw.githubusercontent.com/matt8707/hass-config/master/www/img/dash.png)

#### Sidebar

* Heure et date
* Entities qui sont allumées (lumières et prises)
* Etat des volets roulants
* Etat de la machine à laver
* Etat de l'aspirateur
* Evénement de la journée
* Message pour prévenir qu'il faut sortir les poubelles pour le lendemain
* Alerte sur l'état des batteries des entités si inférieure à 15%

## Hardware

| Marque   | Produit                   | Integration                                                                  | Description                                                                             |
|----------|---------------------------|------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------|
| HP       | ProLiant MicroServer Gen8 | [glances](https://www.home-assistant.io/integrations/glances/)               | 3x8TB Etat du stockage, utilisation RAM et processeur, activation/désactivation Adguard |
| Provalux | Volets roulants Zigbee    | [mqtt](https://www.home-assistant.io/integrations/mqtt/)                     | 10 volets                                                                               |
| Xiaomi   | Mi Roborock S6maxV        | [roborock](https://github.com/humbertogontijo/homeassistant-roborock)        | Aspirateur robot                                                                        |
| Sonoff   | Dongle-e                  | [zigbee2mqtt](https://github.com/Koenkk/zigbee2mqtt)                         | Dongle USB Zigbee USB connecté à une image docker Z2M sous Unraid                       |
| Philips  | TV Ambilight              | [philips-js](https://www.home-assistant.io/integrations/philips_js/)         | TV                                                                                      |
| Amazon   | Fire HD                   | [android debug bridge](https://www.home-assistant.io/integrations/androidtv) | Clé USB pour une autre TV                                                                    |

---

**Repo GitHub de Mattias**
[https://github.com/matt8707/hass-config](https://github.com/matt8707/hass-config)

**Home Assistant Community Topic**
[https://community.home-assistant.io/t/a-different-take-on-designing-a-lovelace-ui/162594](https://community.home-assistant.io/t/a-different-take-on-designing-a-lovelace-ui/162594)
