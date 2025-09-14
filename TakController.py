from Tak import Tak

class TakController:
    def __init__(self, team_white, team_black, board_size=5):
        self.tak = Tak(board_size, team_white, team_black)
        self.board_size = board_size

    def next_move(self, team, move):
        assert isinstance(move,str)
        move_args = move.strip().replace(" ","").replace(".",",").lower().split(";")
        move_type = move_args[0]

        if move_type == "ps":
            self.tak.place_stone(team,eval(move_args[1]))
        elif move_type == "pw":
            self.tak.place_wall(team,eval(move_args[1]))
        elif move_type == "pc":
            self.tak.place_capstone(team,eval(move_args[1]))
        elif move_type == "mo":
            self.tak.move(team, eval(move_args[1]), eval('"' + move_args[2].replace('"','') + '"'), eval(move_args[3]))
        else:
            raise ValueError
