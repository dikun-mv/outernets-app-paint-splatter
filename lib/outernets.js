class Outernets {
  static get settings() {
    try {
      return JSON.parse(decodeURIComponent(window.location.search.slice(1)));
    } catch (error) {
      return null;
    }
  }

  static async sendMetrics(data = []) {
    const settings = Outernets.settings;

    if (!settings) {
      throw new Error('Can not read app settings');
    }

    return fetch(`${settings.baseUrl}app-metrics/${settings.appId}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  }

  static async holdScheduler(time = 0) {
    const settings = Outernets.settings;

    if (!settings) {
      throw new Error('Can not read app settings');
    }

    return fetch(`${settings.baseUrl}holdScheduler`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        areaId: settings.areaId,
        holdTime: time
      })
    });
  }
}
