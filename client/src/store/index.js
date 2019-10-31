import Vue from 'vue';
import Vuex from 'vuex';

// Store에서는 '@'로 src 접근이 불가하다.
import firebaseApi from '../api/firebaseApi';
import { stat } from 'fs';

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		loginState: false,
		loginUser: "",
		chatRoomList: [
			{
				id: 1,
				title: "전국노래자랑 여행",
				location: {
					latitude: 37.501307,
					longitude: 127.03966
				},
				host: {
					uid: 1,
					email: "test@test.com",
					nickname: "testman"
				},
				guest: [
					{
						uid: 2,
						email: "b@b.com",
						nickname: '케로츄'
					},
					{
						uid: 3,
						email: 'c@c.com',
						nickname: '슈슈미밍'
					},
					{
						uid: 4,
						email: 'd@d.com',
						nickname: '빛니리'
					}
				]
			},
			{
				id: 2,
				title: "망고수박",
				location: {
					latitude: 37.519999711926474,
					longitude: 127.0346463314149
				},
				host: {
					uid: 2,
					email: "test2@test2.com",
					nickname: "testman2"
				},
				guest: [
					{
						uid: 2,
						email: "b@b.com",
						nickname: '케로츄'
					},
					{
						uid: 3,
						email: 'c@c.com',
						nickname: '슈슈미밍'
					},
					{
						uid: 4,
						email: 'd@d.com',
						nickname: '빛니리'
					}
				]
			},
			{
				id: 3,
				title: "바나나 우유",
				location: {
					latitude: 37.519347301827864,
					longitude: 127.0349310891608
				},
				host: {
					uid: 3,
					email: "test3@test3.com",
					nickname: "testman3"
				},
				guest: [
					{
						uid: 2,
						email: "b@b.com",
						nickname: '케로츄'
					},
					{
						uid: 3,
						email: 'c@c.com',
						nickname: '슈슈미밍'
					},
					{
						uid: 4,
						email: 'd@d.com',
						nickname: '빛니리'
					}
				]
			}
		],
		chatRoomInfoForChatDetail : "",
	},
	getters: {
		// User Auth Getters
		getLoginState(state) {
			return state.loginState;
		},
		getLoginUser(state) {
			return state.loginUser;
		},

		// Chat Room Getters
		getChatRoomInfo: (state) => (id) => {
			return state.chatRoomList.find(room => room.id === id);
		},
		getChatRoomList(state) {
			return state.chatRoomList;
		},
		getChatRoomInfoForChatDetail(state){
			return state.chatRoomInfoForChatDetail;
		}
	},
	mutations: {
		// User Auth Mutations
		updateLoginState(state, payload){
			state.loginState = payload;	
		},
		updateLoginUser(state, payload){
			const user = {
				uid: '',
				email: '',
				nickname: ''
			}

			if(payload){
				user.uid = payload.uid;
				user.email = payload.email;
				user.nickname = payload.displayName;

				state.loginUser = user;
				state.loginState = true;
			} else {
				state.loginUser = null;
				state.loginState = false;
			}
		},

		// Chat Room Mutations
		setChatRoomLocation (state, chatRoom) {
			state.chatRoomList.forEach((room, index) => {
				if (room.id === chatRoom.id) {
					state.chatRoomList[index].location.latitude = chatRoom.latitude
					state.chatRoomList[index].location.longitude = chatRoom.longitude
				}
			})
		},
		createChatRoom(state, payload) {
			const host = state.loginUser;
			const chatRoom = {
				id: state.chatRoomList.length + 1,
				title: payload.title,
				location: {
					latitude: payload.location.latitude,
					longitude: payload.location.longitude
				},
				host: {
					uid: host.uid,
					email: host.email,
					nickname: host.nickname
				},
				guest: [
					
				]
			}
			state.chatRoomList.push(chatRoom);
		},
		setRoomInfoForChatDetail(state, chatRoom){
			state.chatRoomInfoForChatDetail = chatRoom;
		},
	},
	actions: {
		// User Auth Actions
		async signup(state, payload){
			try {
				const result = await firebaseApi.signup(payload.email, payload.password, payload.nickname);
				state.commit('updateLoginUser', result.user);

				return result;
			} catch (error) {
				throw error;
			}
		},
		async loginWithEmail(state, payload){
			try {
				const result = await firebaseApi.loginWithEmail(payload.email, payload.password);
				state.commit('updateLoginUser', result.user);

				return result;
			} catch (error) {
				throw error;
			}
		},
		async loginWithGoogle(state){
			try {
				const result = await firebaseApi.loginWithGoogle();
				state.commit('updateLoginUser', result.user);

				return result;
			} catch (error) {
				throw error;
			}
		},
		async logout(state){
			try {
				await firebaseApi.logout();
				state.commit('updateLoginUser', null);
			} catch (error) {
				throw error;
			}
		},
		setAuthListener(state){
			try {
					firebase.auth().onAuthStateChanged(function(user) {
						console.log("auth 변화 발생");
						if (user) {
							if(user.uid != state.getters.getLoginUser.uid){
								state.dispatch('logout');
							}
						} else {
							state.commit('updateLoginUser', null);
						}
				});
			} catch (error) {
				console.log("[" + error.code + "] " + error.message);
			}
		}
	}
})
