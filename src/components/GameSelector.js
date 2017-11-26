import React from 'react';
import { Button } from 'reactstrap';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import './css/GameSelector.css';
import {db} from '../firebase';
import {Tabs, Tab} from 'material-ui/Tabs';
import { toast } from 'react-toastify';

export default class GameSelector extends React.Component {

  constructor(){
      super();
      this.state = {
          specs:null,
          matchSpecs: null,
          selectedNewGameSpec: null,
          selectedRecentGameSpec: null,
          tab: 'new_game'
      };
  }

  startNewGame(event){
      if(this.state.selectedNewGameSpec){
          this.props.setSpecId(this.state.selectedNewGameSpec.id, true);
          this.props.setSpec(this.state.selectedNewGameSpec.value, true);
      }else{
          toast.warning('Please select a game first',{
              autoClose: 2000,
              pauseOnHover: false,
              newestOnTop: true
          });
      }
  }

  loadMatch(){
      if(this.state.selectedRecentGameSpec){
          this.props.setSpecId(this.state.selectedRecentGameSpec.id, false);
          this.props.setSpec(this.state.selectedRecentGameSpec.value, false,
              this.state.selectedRecentGameSpec.matchId);
      }else{
          toast.warning('Please select a game first',{
              autoClose: 2000,
              pauseOnHover: false,
              newestOnTop: true
          });
      }
  }

  componentDidMount(){
      this.loadNewGameSpecs();
      this.loadRecentGameSpecs();
  }

  loadNewGameSpecs(){
      let specRef = db.ref('gameBuilder/gameSpecs');
      let self = this;
      specRef.on("value",function(snapshot){
          let specs = snapshot.val();
          let list = [];
          for(let specKey in specs){
              list.push({
                value: specs[specKey],
                label: specs[specKey].gameName,
                id: specKey
            });
          }
        self.setState({specs:list});
      })
  }

  loadRecentGameSpecs(){
      let matchRef = db.ref(`gamePortal/groups/${this.props.groupId}/matches`);
      let self = this;
      matchRef.on("value",function(snapshot){
          let matches = snapshot.val();
          let list = [];
          for(let match in matches){
              let specId = matches[match].gameSpecId;
              let specRef = db.ref(`gameBuilder/gameSpecs/${specId}`);
              specRef.once('value').then((snap)=>{
                  list.push({
                    matchId: match,
                    value: snap.val(),
                    label: snap.val().gameName,
                    id: specId
                  });
                  self.setState({matchSpecs:list});
              });
          }
      })
  }

  changeSelectedNewGameSpec(event){
      this.setState({
          selectedNewGameSpec: event
      });
  }

  changeSelectedRecentGameSpec(event){
      this.setState({
          selectedRecentGameSpec: event
      });
  }

  handleTabChange = (value) => {
      if(value!==this.state.tab){
          this.setState({
            tab: value
          });
      }
  }

  render() {
    return (
        <div className='game-selector-inner-container'>
            <Tabs
                className='side-chat-tabs-container'
                value={this.state.tab}
                onChange={this.handleTabChange.bind(this)}>
                    <Tab label="New Game" value="new_game">
                        <div className='newgame-oldgame-container'>
                            <Select
                              className="spec-selector"
                              name="form-field-name"
                              value={this.state.selectedNewGameSpec}
                              options={this.state.specs}
                              onChange={this.changeSelectedNewGameSpec.bind(this)}
                            />
                            <Button color="success load-game-btn" onClick={this.startNewGame.bind(this)}>Start New Game</Button>
                        </div>
                    </Tab>
                    <Tab label="Recently Played" value="recently_played">
                        <div className='newgame-oldgame-container'>
                            <Select
                              className="spec-selector"
                              name="form-field-name"
                              value={this.state.selectedRecentGameSpec}
                              options={this.state.matchSpecs}
                              onChange={this.changeSelectedRecentGameSpec.bind(this)}
                            />
                            <Button color="success load-game-btn" onClick={this.loadMatch.bind(this)}>Continue Game</Button>
                        </div>
                    </Tab>
            </Tabs>
        </div>
    );
  }
}
