import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import LengthPrinter from './components/Map'
import FakeComp from './components/fakeComp'
import { createStore } from 'redux'
import { Button, Menu, Icon } from 'semantic-ui-react'
import { Provider, connect } from 'react-redux'
import combinedReducer from './components/reducers/index'
import { composeWithDevTools } from 'redux-devtools-extension'
import FakeCases from './components/fakeCases'
import { BrowserRouter as Router, Switch, Route, withRouter, Link } from 'react-router-dom'
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import firebase from './firebase'
import { setUser, clearUser, trueUser, allDoctors, createCases } from './components/actions/index'
import SingleCase from './components/SingleCase';


const store = createStore(combinedReducer, composeWithDevTools())

class Index extends Component {

    state = {
        cases: firebase.database().ref('cases'),
        activeItem: 'home',
    }

    handleItemClick = (e, { name }) => this.setState({ activeItem: name })


    componentDidMount() {
        let cases = []
        firebase.database().ref('cases').on('child_added', snap => {
            let obj = {}
            obj.desc = snap.val().desc
            obj.howto = snap.val().howto
            obj.id = snap.val().id
            obj.address = snap.val().address
            obj.tel = snap.val().tel
            cases.push(obj)
            this.props.createCases([obj])
        })

        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                this.props.setUser(user)
                this.getTrueUser(user.uid)
                this.getAllDoctors()
            } else {
                this.props.clearUser()
            }
        })
    }

    getAllDoctors = () => {
        firebase.database().ref('users').on('child_added', snap => {
            this.props.allDoctors(snap.val())
        })
    }

    handleSignOut = () => {
        console.log('click')
        firebase.auth().signOut().then(() => {console.log('user logged out')}).catch(e => console.log(e))
        this.props.clearUser()
    }

    getTrueUser = (uid) => {
        firebase.database().ref('users').child(uid).once('value', snap => {
            this.props.trueUser(snap.val())
        })
    }

    render() {
        let page;
        const { activeItem } = this.state.activeItem;

        if (this.props.user) {
            page = (<Menu style={{ fontSize: '20px', backgroundColor: '#331E38', fontColor: 'white' }} secondary>
                <Link to='/'>
                    <Menu.Item
                        name='home'
                        style={{ color: 'white' }}
                        active={activeItem === 'home'}
                        onClick={this.handleItemClick}
                    />
                </Link>

                <Link to='/map'>
                    <Menu.Item
                        name='Map'
                        style={{ color: 'white' }}

                        active={activeItem === 'home'}
                        onClick={this.handleItemClick}
                    />
                </Link>
                <Link to='/cases'>
                    <Menu.Item
                        name='Cases'
                        style={{ color: 'white' }}

                        active={activeItem === 'home'}
                        onClick={this.handleItemClick}
                    />
                </Link>


                <Menu.Menu position='right'>
                    <Menu.Item
                        name='logout'
                        style={{ color: 'white' }}

                        active={activeItem === 'logout'}
                        onClick={this.handleSignOut}
                        // onClick={this.handleItemClick}
                    />
                    {/* <button onClick={this.handleSignOut}>Logoutaa</button> */}
                </Menu.Menu>
                
            </Menu>)
        } else {
            page = (<Menu secondary style={{ fontSize: '20px', backgroundColor: '#331E38', fontColor: 'white' }}>
                <Link to='/'>
                    <Menu.Item
                        name='home'
                        style={{color: 'white'}}

                        active={activeItem === 'home'}
                        onClick={this.handleItemClick}
                    />
                </Link>
                <Link to='/register'>
                    <Menu.Item
                        name='Registration'
                        style={{color: 'white'}}

                        active={activeItem === 'messages'}
                        onClick={this.handleItemClick}
                    />
                </Link>

                <Link to='/login'>
                    <Menu.Item
                        name='Login'
                        style={{color: 'white'}}

                        active={activeItem === 'home'}
                        onClick={this.handleItemClick}
                    />
                </Link>
            </Menu>)
        }



        return (
            <div>
                {page}
                <Link to='/comp'>
                <h2 style={{ display: 'flex', justifyContent: 'center'}}>Нажмите для вызова врача</h2>
                    <Icon.Group style={{ display: 'flex', justifyContent: 'center', color: '#E63B2E' }} size='big'>
                        <Icon size='massive' name='exclamation circle' />
                    </Icon.Group>
                </Link>

                <Switch>
                    <Route path='/cases' component={FakeCases} />
                    <Route exact path='/comp' component={FakeComp} />
                    <Route path='/register' component={Register} />
                    <Route path='/login' component={Login} />
                    <Route path='/map' component={LengthPrinter} />
                    <Route exact path='/:id' component={SingleCase} />
                </Switch>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    user: state.user.currentUser,
    trueUser: state.trueUser
})

const mapDispatchToProps = dispatch => ({
    setUser: (user) => dispatch(setUser(user)),
    clearUser: () => dispatch(clearUser()),
    createCases: (cases) => dispatch(createCases(cases)),
    trueUser: (user2) => dispatch(trueUser(user2)),
    allDoctors: (doctors) => dispatch(allDoctors(doctors))
})

const IndexWithRouter = withRouter(connect(mapStateToProps, mapDispatchToProps)(Index))


ReactDOM.render(
    <Provider store={store}>
        <Router>
            <IndexWithRouter />
        </Router>
    </Provider>,
    document.getElementById('root'))