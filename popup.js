function updateShortsList() {
	let selectPlaylist = document.getElementById("playlistSelect");
	let selectedPlaylist =
		playlistSelect.options[playlistSelect.selectedIndex].value;
	chrome.storage.sync.get("playlists", function (data) {
		let playlists = data.playlists || {};
		let shorts = playlists[selectedPlaylist] || [];
		let shortsListSection = document.getElementById("shortsList");
		shortsListSection.innerHTML = "";

		// new list
		let ul = document.createElement("ul");
		for (let i = 0; i < shorts.length; i++) {
			let li = document.createElement("li");
			let a = document.createElement("a");
			a.href = shorts[i].url;
			a.textContent = shorts[i].name;
			a.target = "_blank";
			li.appendChild(a);

			let removeButton = document.createElement("button");
			removeButton.textContent = "x";
			removeButton.id = "removeButton";
			removeButton.addEventListener("click", function () {
				shorts.splice(i, 1);
				playlists[selectedPlaylist] = shorts;
				chrome.storage.sync.set({ playlists: playlists }, function () {
					updateShortsList();
				});
			});
			li.appendChild(removeButton);

			ul.appendChild(li);
		}
		shortsListSection.appendChild(ul);
	});
}

// update the select html element with the list of playlists
function updateSelectPlaylist() {
	chrome.storage.sync.get("playlists", function (data) {
		let playlists = data.playlists || {};
		let selectPlaylist = document.getElementById("playlistSelect");
		selectPlaylist.innerHTML = "";
		//creating new playlists
		for (let playlistTitle in playlists) {
			let option = document.createElement("option");
			option.value = playlistTitle;
			option.textContent = playlistTitle;
			selectPlaylist.appendChild(option);
		}
		updateShortsList();
	});
}

//removing selected playlist
document
	.getElementById("removePlaylist")
	.addEventListener("click", function () {
		let selectPlaylist = document.getElementById("playlistSelect");
		let selectedPlaylist =
			playlistSelect.options[playlistSelect.selectedIndex].value;
		chrome.storage.sync.get("playlists", function (data) {
			let playlists = data.playlists || {};
			delete playlists[selectedPlaylist];
			chrome.storage.sync.set({ playlists: playlists }, function () {
				updateSelectPlaylist();
				updateShortsList();
			});
		});
	});

// adding shorts to playlists
document.getElementById("addShort").addEventListener("click", function () {
	let selectPlaylist = document.getElementById("playlistSelect");
	let selectedPlaylist =
		playlistSelect.options[playlistSelect.selectedIndex].value;
	let shortName = document.getElementById("shortName").value;
	if (!shortName) {
		alert("Please enter a short name");
		return;
	}
	document.getElementById("shortName").value = "";
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		let currentTab = tabs[0];
		let shortUrl = currentTab.url;
		chrome.storage.sync.get("playlists", function (data) {
			let playlists = data.playlists || {};
			let shorts = playlists[selectedPlaylist] || [];
			shorts.push({ url: currentTab.url, name: shortName });
			playlists[selectedPlaylist] = shorts;
			chrome.storage.sync.set({ playlists: playlists }, function () {
				updateShortsList();
			});
		});
	});
});

// creating new playlists
document
	.getElementById("createPlaylist")
	.addEventListener("click", function () {
		let playlistTitle = document.getElementById("playlistTitle").value;
		if (playlistTitle) {
			chrome.storage.sync.get("playlists", function (data) {
				let playlists = data.playlists || {};
				playlists[playlistTitle] = [];
				chrome.storage.sync.set({ playlists: playlists }, function () {
					updateSelectPlaylist();
				});
			});
		} else {
			alert("Please enter a playlist title");
		}
		document.getElementById("playlistTitle").value = "";
	});

// update the shorts list when selected playlist changes
document
	.getElementById("playlistSelect")
	.addEventListener("change", function () {
		updateShortsList();
	});

// update the select element when opening the popup
updateSelectPlaylist();
