from random import random

def start(my_team, enemy_team):
    print("start")

    print(f"--- my team ({my_team.get_color()}) ---")
    print("stones: ", my_team.get_stones())
    print("capstones: ", my_team.get_capstone())
    print("time: ", my_team.get_time())
    print("lives: ", my_team.get_lives())

    print(f"--- enemy team ({enemy_team.get_color()}) ---")
    print("stones: ", enemy_team.get_stones())
    print("capstones: ", enemy_team.get_capstone())
    print("time: ", enemy_team.get_time())
    print("lives: ", enemy_team.get_lives())

    print()

def step(board):
    print("step")

    print("board size:", board.board_size())

    def find_move():
        for i in range(board.board_size()):
            for j in range(board.board_size()):
                if not board[i, j]:
                    if random() > 0.3:
                        return f"PS;({i},{j})"
                    else:
                        return f"PW;({i},{j})"

    move = find_move()
    if move is None:
        print("found no empty tile :(")
    else:
        print("move: ", move)

    print()
    return move
