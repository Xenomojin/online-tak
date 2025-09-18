import random
from Team import Team
from Tak import Board, Piece

team = None

def start(my_team, opponent_team):
    global team

    assert isinstance(my_team, Team)
    assert isinstance(opponent_team, Team)

    print(f"--- my team ({my_team.get_color()}) ---")
    print("stones: ", my_team.get_stones())
    print("capstones: ", my_team.get_capstone())
    print("time: ", my_team.get_time())
    print("lives: ", my_team.get_lives())
    print()

    print(f"--- opponent team ({opponent_team.get_color()}) ---")
    print("stones: ", opponent_team.get_stones())
    print("capstones: ", opponent_team.get_capstone())
    print("time: ", opponent_team.get_time())
    print("lives: ", opponent_team.get_lives())

    team = my_team

    print()

def step(board):
    global team

    assert isinstance(board, Board)

    print("board size:", board.board_size())

    possible_moves = []

    for i in range(board.board_size()):
        for j in range(board.board_size()):
            stack = board[i, j]

            if stack:
                top_piece = stack[-1]
                assert isinstance(top_piece, Piece)
                assert isinstance(top_piece.team, Team)
                assert top_piece.kind
            else:
                if team.has_stone():
                    possible_moves.append(f"PS;({i},{j})")
                    possible_moves.append(f"PW;({i},{j})")
                if team.has_capstone():
                    possible_moves.append(f"PC;({i},{j})")

    if not possible_moves:
        print("found no empty tile :(")
        print()
        return None
    else:
        random_move = random.choice(possible_moves)
        print("move: ", random_move)
        print()
        return random_move
