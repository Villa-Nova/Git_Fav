class GithubUser {
  static search(username) {
    const endPoint = `
    https://api.github.com/users/${username}
    `;

    return fetch(endPoint)
    .then(data => data.json())
    .then(({login, name, public_repos, followers}) => ({
      login, name, public_repos, followers
    }));
  };
};

class Favorite {
  constructor(root) {
    this.root = document
    .querySelector(root);

    this.load();
  };

  load() {
    const entries = JSON.parse(
    localStorage.getItem("@user_save:")) || [];

    this.entries = entries;  
  };

  save() {
    localStorage.setItem("@user_save:", 
    JSON.stringify(this.entries));
  };

  async add(username) {
    try {
      const userExist = this.entries
      .find(entry => entry.login === username);
      if(userExist) {
        throw new Error("Usuário já cadastrado🙄");
      };
      
      const user = await  GithubUser.search(username);
      if(user.login === undefined) {
        throw new Error(`Usuário não encontrado❌`);
      };

      this.entries = [user, ...this.entries];
      this.update();
      this.save();
    } catch(error) {
      alert(error.message);
    };
  };

  delete(user) {
    const filterEntries = this.entries
    .filter(entry => entry.login != user.login);

    this.entries = filterEntries;
    this.update();
    this.save();
  };
};

export class FavoriteViewer extends Favorite {
  constructor(root) {
    super(root);
    
    this.tbody = this.root
    .querySelector("table tbody");
    
    this.update();
    this.onadd();
  };

  update() {
    this.removeAll();

    this.entries.forEach(user => {
      const row = this.createRow();
      
      row.querySelector(".user img")
      .src = `https://github.com/${user.login}.png`;

      row.querySelector(".user img")
      .alt = `foto de perfil de ${user.name}`;

      row.querySelector(".user a")
      .href = `https://github.com/${user.login}`;

      row.querySelector(".user p")
      .innerHTML = `${user.name}`;

      row.querySelector(".user span")
      .innerHTML = `&#47${user.login}`;

      row.querySelector(".repositories")
      .innerHTML = `${user.public_repos}`;

      row.querySelector(".followers")
      .innerHTML = `${user.followers}`;

      row.querySelector(".remove")
      .onclick = () => {
        const isOk = confirm("Excluir usuário?");
        if(isOk){
          this.delete(user);
        };
      };

      this.tbody.append(row);
    });
  };

  onadd() {
    const addButton = this.root
    .querySelector(".fetch");

    addButton.onclick = () => {
      let { value } = this.root
      .querySelector("#input--search");

      this.add(value);
    };
  };

  createRow() {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="user">
        <img src="https://github.com/mateusvillanova.png" alt="foto de perfil de um usuario" />

        <a href="https://github.com/mateusvillanova" target="_blank">
          <p>Mateus Villa Nova</p>
          <span>&#47;Villa-Nova</span>
        </a>
      </td>

      <td class="repositories">
        1000
      </td>

      <td class="followers">
        1000
      </td>

      <td>
        <button class="remove">
          Remover
        </button>
      </td>
    `;

    return tr;
  };

  removeAll() {
    this.tbody.querySelectorAll("tr")
    .forEach(tr => {
      tr.remove();
    });
  };
};